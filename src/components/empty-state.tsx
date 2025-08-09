import { motion } from "framer-motion"
import { Camera, Upload as UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  filter: 'all' | 'favorites'
  selectedTag: string | null
  showUpload: boolean
  onUploadClick: () => void
  onClearFilters: () => void
}

export function EmptyState({ filter, selectedTag, showUpload, onUploadClick, onClearFilters }: EmptyStateProps) {
  const isFavoritesFilter = filter === 'favorites'
  const hasTagFilter = selectedTag !== null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="text-center py-12 sm:py-16 lg:py-20 px-4"
    >
      <Camera className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-pink-300 mx-auto mb-4 sm:mb-6" />
      
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        {hasTagFilter && selectedTag
          ? `No photos with #${selectedTag}`
          : isFavoritesFilter 
            ? 'No favorites yet'
            : 'No photos yet'}
      </h3>
      
      <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
        {hasTagFilter && selectedTag
          ? `No photos found with the tag "#${selectedTag}". Try selecting a different tag or clearing filters.`
          : isFavoritesFilter 
            ? 'Start hearting some photos to see them here!'
            : 'Upload your first photos to begin creating your beautiful memory gallery.'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasTagFilter && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base"
          >
            Clear Filters
          </Button>
        )}
        {!showUpload && !isFavoritesFilter && !hasTagFilter && (
          <Button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-full font-semibold text-sm sm:text-base"
          >
            <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden xs:inline">Upload Your First Photo</span>
            <span className="xs:hidden">Upload Photo</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
}