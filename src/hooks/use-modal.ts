import React, { useState } from 'react'
import { Photo } from './use-photos'

export function useModal() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Ensure scrolling is always available when modal is not open
  React.useEffect(() => {
    if (!isModalOpen) {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  const handleImageClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPhoto(null)
    // Ensure scrolling is restored
    document.body.style.overflow = 'unset'
  }

  const handleNextPhoto = (filteredPhotos: Photo[]) => {
    if (!selectedPhoto) return
    const currentIndex = filteredPhotos.findIndex(p => p._id === selectedPhoto._id)
    const nextIndex = (currentIndex + 1) % filteredPhotos.length
    setSelectedPhoto(filteredPhotos[nextIndex])
  }

  const handlePreviousPhoto = (filteredPhotos: Photo[]) => {
    if (!selectedPhoto) return
    const currentIndex = filteredPhotos.findIndex(p => p._id === selectedPhoto._id)
    const prevIndex = currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1
    setSelectedPhoto(filteredPhotos[prevIndex])
  }

  const getNavigationProps = (filteredPhotos: Photo[]) => {
    if (!selectedPhoto) return { hasNext: false, hasPrevious: false }
    
    const currentIndex = filteredPhotos.findIndex(p => p._id === selectedPhoto._id)
    return {
      hasNext: filteredPhotos.length > 1 && currentIndex < filteredPhotos.length - 1,
      hasPrevious: filteredPhotos.length > 1 && currentIndex > 0
    }
  }

  return {
    selectedPhoto,
    isModalOpen,
    handleImageClick,
    handleCloseModal,
    handleNextPhoto,
    handlePreviousPhoto,
    getNavigationProps,
  }
}