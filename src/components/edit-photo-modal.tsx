import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Photo {
  _id: string
  title?: string
  description?: string
  imageUrl?: string
  tags: string[]
  isFavorite: boolean
  uploadedAt: number
}

interface EditPhotoModalProps {
  isOpen: boolean
  photo: Photo | null
  onClose: () => void
  onSave: (photo: Photo, updates: { description: string; tags: string[] }) => void
}

export function EditPhotoModal({ isOpen, photo, onClose, onSave }: EditPhotoModalProps) {
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when photo changes
  useEffect(() => {
    if (photo) {
      setDescription(photo.description || "")
      setTags(photo.tags.join(", "))
    }
  }, [photo])

  const handleSave = async () => {
    if (!photo) return

    setIsSaving(true)
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await onSave(photo, {
        description: description.trim(),
        tags: tagsArray,
      })
      
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (photo) {
      setDescription(photo.description || "")
      setTags(photo.tags.join(", "))
    }
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleCancel()
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
  }, [handleCancel, handleSave])

  // Add keyboard event listener
  useEffect(() => {
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

  if (!photo) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Edit Photo</h2>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Photo Preview */}
                {photo.imageUrl && (
                  <div className="mb-6">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.description || 'Memory photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell a story about this moment..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none shadow-sm text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="relative">
                      <TagIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="love, memories, vacation (comma separated)"
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>

                  {/* Current Tags Preview */}
                  {tags.trim() && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                      <div className="flex flex-wrap gap-2">
                        {tags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0)
                          .map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-pink-100 text-pink-700 text-sm rounded-full border border-pink-200 shadow-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Press <kbd className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-mono shadow-sm">ESC</kbd> to cancel
                    • <kbd className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-mono shadow-sm">Cmd/Ctrl + Enter</kbd> to save
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}