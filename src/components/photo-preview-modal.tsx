import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Download, Calendar, Tag as TagIcon, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photo {
  _id: string
  title: string
  description?: string
  imageUrl?: string
  tags: string[]
  isFavorite: boolean
  uploadedAt: number
}

interface PhotoPreviewModalProps {
  isOpen: boolean
  photo: Photo | null
  onClose: () => void
  onToggleFavorite?: (id: string) => void
  onTagClick?: (tag: string) => void
  onEdit?: (photo: Photo) => void
  onDelete?: (photo: Photo) => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function PhotoPreviewModal({
  isOpen,
  photo,
  onClose,
  onToggleFavorite,
  onTagClick,
  onEdit,
  onDelete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: PhotoPreviewModalProps) {
  if (!photo) return null

  const handleDownload = async () => {
    if (!photo?.imageUrl) return

    try {
      // Show downloading state (you could add a loading state here)
      const response = await fetch(photo.imageUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Clean filename from photo title
      const filename = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the object URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // You could show a toast notification here
      alert('Download failed. Please try again.')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && hasPrevious) onPrevious?.()
    if (e.key === 'ArrowRight' && hasNext) onNext?.()
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext])

  // Add keyboard event listener
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={handleBackdropClick}
        >
          {/* Navigation Buttons - Hidden on mobile */}
          {hasPrevious && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={onPrevious}
              className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors hidden sm:block"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          )}

          {hasNext && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={onNext}
              className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors hidden sm:block"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          )}

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-6xl max-h-[95vh] sm:max-h-[90vh] w-full mx-2 sm:mx-0 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="secondary"
              size="icon"
              className="absolute top-1 right-1 sm:top-0 sm:right-0 z-10 bg-white/80 hover:bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Mobile Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 space-x-2 hidden sm:flex">
              {hasPrevious && (
                <Button
                  onClick={onPrevious}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              {hasNext && (
                <Button
                  onClick={onNext}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2 h-full max-h-[95vh] sm:max-h-[90vh]">
              {/* Image Section */}
              <div className="relative bg-gray-100 flex items-center justify-center h-[40vh] sm:h-[50vh] md:min-h-full order-1 overflow-hidden">
                {photo.imageUrl && (
                  <motion.img
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    src={photo.imageUrl}
                    alt={photo.description || 'Memory photo'}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Mobile Navigation Buttons on Image */}
                {hasPrevious && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={onPrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors md:hidden"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </motion.button>
                )}

                {hasNext && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={onNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors md:hidden"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>

              {/* Info Section */}
              <div className="flex flex-col p-4 sm:p-6 md:p-8 bg-gradient-to-br from-pink-50 to-purple-50 order-2 flex-1 max-h-[55vh] sm:max-h-[45vh] md:max-h-full overflow-y-auto">
                <div className="flex-1 space-y-4 sm:space-y-6">
                  {/* Title and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center text-gray-500 text-sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(photo.uploadedAt)}
                      </motion.div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onToggleFavorite?.(photo._id)}
                        className={cn(
                          "rounded-full transition-colors w-8 h-8 sm:w-10 sm:h-10",
                          photo.isFavorite && "bg-red-100 border-red-300"
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-3 h-3 sm:w-4 sm:h-4 transition-colors",
                            photo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                          )}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDownload}
                        className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit?.(photo)}
                        className="rounded-full w-8 h-8 sm:w-10 sm:h-10 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this photo?')) {
                            onDelete?.(photo)
                            onClose()
                          }
                        }}
                        className="rounded-full w-8 h-8 sm:w-10 sm:h-10 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  {photo.description && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <h3 className="font-semibold text-gray-700">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{photo.description}</p>
                    </motion.div>
                  )}

                  {/* Tags */}
                  {photo.tags.length > 0 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <h3 className="font-semibold text-gray-700">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {photo.tags.map((tag, index) => (
                          <motion.button
                            key={tag}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            onClick={() => {
                              onTagClick?.(tag)
                              onClose()
                            }}
                            className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full border border-pink-200 hover:bg-pink-200 hover:border-pink-300 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}