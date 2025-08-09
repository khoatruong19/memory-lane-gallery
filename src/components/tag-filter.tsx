import { motion } from "framer-motion"
import { X, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photo {
  _id: string
  title?: string
  description?: string
  imageUrl?: string
  tags: string[]
  isFavorite: boolean
  uploadedAt: number
}

interface TagFilterProps {
  photos: Photo[]
  selectedTag: string | null
  onTagClick: (tag: string) => void
  onClearFilters: () => void
}

export function TagFilter({ photos, selectedTag, onTagClick, onClearFilters }: TagFilterProps) {
  // Get all unique tags from photos with their counts
  const tagCounts = photos.reduce((acc, photo) => {
    photo.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const availableTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a) // Sort by frequency
    .slice(0, 10) // Show only top 10 tags

  if (availableTags.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Filter by Tags</h3>
        {selectedTag && (
          <Button
            variant="ghost"
            size="sm" 
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map(([tag, count]) => (
          <motion.button
            key={tag}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTagClick(tag)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
              selectedTag === tag
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-md transform scale-105"
                : "bg-white/70 text-gray-700 border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:shadow-sm"
            )}
          >
            <span className="flex items-center gap-1">
              #{tag}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-normal",
                selectedTag === tag
                  ? "bg-white/20 text-white"
                  : "bg-pink-100 text-pink-600"
              )}>
                {count}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}