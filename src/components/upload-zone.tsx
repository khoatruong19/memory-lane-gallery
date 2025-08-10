import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, Heart, Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { compressMultipleImages, type CompressionResult } from "@/lib/image-compression"

interface UploadZoneProps {
  onUpload?: (files: FileList, metadata: { description: string; tags: string[] }) => void
  className?: string
}

export function UploadZone({ onUpload, className }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const validateFiles = (files: FileList): { valid: FileList; invalid: string[] } => {
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB - exceeds 10MB limit)`)
      } else if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image file)`)
      } else {
        validFiles.push(file)
      }
    })

    // Create a new FileList-like object
    const dataTransfer = new DataTransfer()
    validFiles.forEach(file => dataTransfer.items.add(file))

    return { valid: dataTransfer.files, invalid: invalidFiles }
  }

  const compressFiles = async (files: FileList) => {
    setIsCompressing(true)
    try {
      const results = await compressMultipleImages(files, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeKB: 500
      })

      setCompressionResults(results)

      // Create new FileList with compressed files
      const dataTransfer = new DataTransfer()
      results.forEach(result => dataTransfer.items.add(result.file))

      return dataTransfer.files
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const { valid, invalid } = validateFiles(files)

      if (invalid.length > 0) {
        alert(`Some files were skipped:\n${invalid.join('\n')}`)
      }

      if (valid.length > 0) {
        const compressedFiles = await compressFiles(valid)
        setSelectedFiles(compressedFiles)
        setShowMetadata(true)
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const { valid, invalid } = validateFiles(files)

      if (invalid.length > 0) {
        alert(`Some files were skipped:\n${invalid.join('\n')}`)
      }

      if (valid.length > 0) {
        const compressedFiles = await compressFiles(valid)
        setSelectedFiles(compressedFiles)
        setShowMetadata(true)
      }
    }
  }

  const handleUpload = async () => {
    if (selectedFiles && !isUploading) {
      setIsUploading(true)
      try {
        const tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)

        await onUpload?.(selectedFiles, {
          description: description.trim(),
          tags: tagsArray,
        })

        // Reset form
        setSelectedFiles(null)
        setShowMetadata(false)
        setDescription("")
        setTags("")
        setCompressionResults([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleCancel = () => {
    setSelectedFiles(null)
    setShowMetadata(false)
    setDescription("")
    setTags("")
    setCompressionResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (showMetadata && selectedFiles) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("w-full max-w-md mx-auto px-4", className)}
      >
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Add Photo Details
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>

                {/* Show file list with compression info */}
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="space-y-1">
                    {Array.from(selectedFiles).map((file, index) => {
                      const result = compressionResults[index]
                      return (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 text-left">{file.name}</span>
                          <div className="text-right ml-2">
                            <div className="text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </div>
                            {result && result.compressionRatio > 0 && (
                              <div className="text-green-600 text-xs">
                                -{result.compressionRatio}%
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description {selectedFiles.length > 1 && '(applied to all photos)'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={selectedFiles.length > 1 ? "Describe this collection of photos..." : "Tell a story about this moment..."}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags {selectedFiles.length > 1 && '(applied to all photos)'}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="love, memories, vacation (comma separated)"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-sm sm:text-base"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading {selectedFiles?.length} photo{selectedFiles?.length !== 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Upload {selectedFiles?.length} photo{selectedFiles?.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-lg mx-auto px-4", className)}
    >
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer group",
          isDragOver
            ? "border-pink-400 bg-pink-50"
            : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          animate={{
            scale: isDragOver ? 1.1 : 1,
            rotate: isDragOver ? 5 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="mb-4"
        >
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-pink-400 group-hover:text-pink-500 transition-colors" />
        </motion.div>

        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          Upload Your Memories
        </h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          <span className="hidden sm:inline">Drag and drop your photos here, or click to browse</span>
          <span className="sm:hidden">Tap to select your photos</span>
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Supports JPG, PNG and other image formats • Multiple files supported • Auto-compressed to ~500KB
        </p>
        {(isCompressing || isUploading) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl sm:rounded-2xl">
            <div className="flex items-center space-x-2 text-pink-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">
                {isCompressing ? "Optimizing images..." : "Uploading..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}