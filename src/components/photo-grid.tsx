import { motion } from "framer-motion"
import { Heart, Download, Eye, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Photo } from "@/hooks/use-photos"

import type { Id } from '../../convex/_generated/dataModel'

interface PhotoGridProps {
  photos: Photo[]
  onToggleFavorite?: (id: Id<"photos">) => void
  onImageClick?: (photo: Photo) => void
  onDownload?: (photo: Photo) => void
  onDelete?: (photo: Photo) => void
  onTagClick?: (tag: string) => void
  downloadingIds?: Set<Id<"photos">>
}

export function PhotoGrid({ photos, onToggleFavorite, onImageClick, onDownload, onDelete, onTagClick, downloadingIds }: PhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<Id<"photos"> | null>(null)

  const handleDownload = async (photo: Photo) => {
    if (onDownload) {
      onDownload(photo)
    } else {
      // Fallback download implementation
      if (photo.imageUrl) {
        try {
          const response = await fetch(photo.imageUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `memory_${new Date().toISOString().slice(0, 10)}_${photo._id.slice(-6)}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Download failed:', error)
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
      {photos.map((photo, index) => (
        <motion.div
          key={photo._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative"
          onMouseEnter={() => setHoveredPhoto(photo._id)}
          onMouseLeave={() => setHoveredPhoto(null)}
        >
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2">
            {photo.imageUrl && (
              <div className="aspect-square relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.description || 'Memory photo'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => onImageClick?.(photo)}
                />

                {/* Overlay on hover - Hidden on mobile for better touch experience */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPhoto === photo._id ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black bg-opacity-20 items-center justify-center hidden sm:flex"
                >
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageClick?.(photo)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      disabled={downloadingIds?.has(photo._id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(photo)
                      }}
                    >
                      {downloadingIds?.has(photo._id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Are you sure you want to delete this photo?')) {
                          onDelete?.(photo)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>

                {/* Mobile action buttons - Always visible on mobile */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between sm:hidden">
                  <div className="flex space-x-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageClick?.(photo)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-xs"
                      disabled={downloadingIds?.has(photo._id)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(photo)
                      }}
                    >
                      {downloadingIds?.has(photo._id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-red-100 hover:text-red-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm('Are you sure you want to delete this photo?')) {
                        onDelete?.(photo)
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Favorite button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/80 hover:bg-white transition-colors w-8 h-8 sm:w-10 sm:h-10",
                    photo.isFavorite && "bg-red-100 hover:bg-red-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.(photo._id)
                  }}
                >
                  <Heart
                    className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 transition-colors",
                      photo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    )}
                  />
                </Button>
              </div>
            )}

            {/* Photo info */}
            <div className="p-3 ">
              {photo.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                  {photo.description}
                </p>
              )}
              {photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {/* Show 2 tags on mobile, 3 on larger screens */}
                  <div className="flex flex-wrap gap-1 sm:hidden">
                    {photo.tags.slice(0, 2).map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTagClick?.(tag)
                        }}
                        className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full hover:bg-pink-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                    {photo.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{photo.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTagClick?.(tag)
                        }}
                        className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full hover:bg-pink-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                    {photo.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{photo.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}