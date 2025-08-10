import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Photo } from './use-photos'

const PHOTOS_PER_PAGE = 20

export function usePhotosPaginated() {
  const [downloadingIds, setDownloadingIds] = useState<Set<Id<"photos">>>(new Set())
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Convex hooks
  const photosPage = useQuery(api.photos.getPhotosPaginated, 
    hasNextPage ? { limit: PHOTOS_PER_PAGE, cursor: cursor || undefined } : 'skip'
  )
  const uploadPhoto = useMutation(api.photos.upload)
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const toggleFavorite = useMutation(api.photos.toggleFavorite)
  const deletePhoto = useMutation(api.photos.deletePhoto)
  const updatePhoto = useMutation(api.photos.updatePhoto)

  const isLoading = isInitialLoad && photosPage === undefined

  // Handle initial load and subsequent pages
  useEffect(() => {
    if (photosPage) {
      if (isInitialLoad) {
        setAllPhotos(photosPage.photos)
        setIsInitialLoad(false)
      } else {
        setAllPhotos(prev => [...prev, ...photosPage.photos])
        setIsFetchingNextPage(false)
      }
      
      setCursor(photosPage.nextCursor)
      setHasNextPage(photosPage.hasNextPage)
    }
  }, [photosPage, isInitialLoad])

  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      setIsFetchingNextPage(true)
    }
  }, [hasNextPage, isFetchingNextPage, isLoading])

  const refreshPhotos = useCallback(() => {
    setAllPhotos([])
    setCursor(null)
    setHasNextPage(true)
    setIsInitialLoad(true)
    setIsFetchingNextPage(false)
  }, [])

  const handleUpload = async (files: FileList, metadata: { description: string; tags: string[] }) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadUrl = await generateUploadUrl()
        
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        
        const { storageId } = await result.json()
        
        return await uploadPhoto({
          description: metadata.description,
          imageId: storageId,
          tags: metadata.tags,
          isFavorite: false
        })
      })

      await Promise.all(uploadPromises)
      // Refresh to show new photos at the top
      refreshPhotos()
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  const handleToggleFavorite = async (id: Id<"photos">) => {
    try {
      await toggleFavorite({ id })
      // Update the photo in the local state
      setAllPhotos(prev => 
        prev.map(photo => 
          photo._id === id 
            ? { ...photo, isFavorite: !photo.isFavorite }
            : photo
        )
      )
    } catch (error) {
      console.error('Toggle favorite failed:', error)
      throw error
    }
  }

  const handleDownload = async (photo: Photo) => {
    if (!photo.imageUrl || downloadingIds.has(photo._id)) return
    
    setDownloadingIds(prev => new Set(prev).add(photo._id))
    
    try {
      const response = await fetch(photo.imageUrl)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `memory_${timestamp}_${photo._id.slice(-6)}.jpg`
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      console.log(`Downloaded: ${filename}`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(photo._id)
        return newSet
      })
    }
  }

  const handleDelete = async (photo: Photo) => {
    try {
      await deletePhoto({ id: photo._id })
      // Remove from local state
      setAllPhotos(prev => prev.filter(p => p._id !== photo._id))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete photo. Please try again.')
      throw error
    }
  }

  const handleEdit = async (photo: Photo, updates: { description: string; tags: string[] }) => {
    try {
      await updatePhoto({ 
        id: photo._id,
        description: updates.description,
        tags: updates.tags
      })
      // Update in local state
      setAllPhotos(prev => 
        prev.map(p => 
          p._id === photo._id 
            ? { ...p, description: updates.description, tags: updates.tags }
            : p
        )
      )
    } catch (error) {
      console.error('Edit failed:', error)
      alert('Failed to update photo. Please try again.')
      throw error
    }
  }

  return {
    photos: allPhotos,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    downloadingIds,
    handleUpload,
    handleToggleFavorite,
    handleDownload,
    handleDelete,
    handleEdit,
  }
}