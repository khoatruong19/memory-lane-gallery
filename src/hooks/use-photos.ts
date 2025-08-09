import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

import type { Id } from '../../convex/_generated/dataModel'

export interface Photo {
  _id: Id<"photos">
  _creationTime: number
  title?: string
  description?: string
  imageUrl: string | null
  imageId: Id<"_storage">
  tags: string[]
  isFavorite: boolean
  uploadedAt: number
}

export function usePhotos() {
  const [downloadingIds, setDownloadingIds] = useState<Set<Id<"photos">>>(new Set())

  // Convex hooks
  const photos = useQuery(api.photos.getAllPhotos)
  const isLoading = photos === undefined
  const uploadPhoto = useMutation(api.photos.upload)
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const toggleFavorite = useMutation(api.photos.toggleFavorite)
  const deletePhoto = useMutation(api.photos.deletePhoto)
  const updatePhoto = useMutation(api.photos.updatePhoto)

  const handleUpload = async (files: FileList, metadata: { description: string; tags: string[] }) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Generate upload URL for each file
        const uploadUrl = await generateUploadUrl()
        
        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        
        const { storageId } = await result.json()
        
        // Save photo metadata to database
        await uploadPhoto({
          description: metadata.description,
          imageId: storageId,
          tags: metadata.tags,
          isFavorite: false
        })
      })

      // Wait for all uploads to complete
      await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  const handleToggleFavorite = async (id: Id<"photos">) => {
    try {
      await toggleFavorite({ id })
    } catch (error) {
      console.error('Toggle favorite failed:', error)
      throw error
    }
  }

  const handleDownload = async (photo: Photo) => {
    if (!photo.imageUrl || downloadingIds.has(photo._id)) return
    
    // Add to downloading set
    setDownloadingIds(prev => new Set(prev).add(photo._id))
    
    try {
      const response = await fetch(photo.imageUrl)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename using timestamp and photo ID
      const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
      const filename = `memory_${timestamp}_${photo._id.slice(-6)}.jpg`
      link.download = filename
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url)
      
      // Show success feedback
      console.log(`Downloaded: ${filename}`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      // Remove from downloading set
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
    } catch (error) {
      console.error('Edit failed:', error)
      alert('Failed to update photo. Please try again.')
      throw error
    }
  }

  return {
    photos: photos || [],
    isLoading,
    downloadingIds,
    handleUpload,
    handleToggleFavorite,
    handleDownload,
    handleDelete,
    handleEdit,
  }
}