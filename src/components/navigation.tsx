import { motion } from "framer-motion"
import { Heart, Camera, Upload as UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  filter: 'all' | 'favorites'
  setFilter: (filter: 'all' | 'favorites') => void
  showUpload: boolean
  setShowUpload: (show: boolean) => void
  photosCount: number
  favoritesCount: number
}

export function Navigation({
  filter,
  setFilter,
  showUpload,
  setShowUpload,
  photosCount,
  favoritesCount
}: NavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0 lg:space-x-6 mb-6 sm:mb-8"
    >
      <div className="relative flex bg-white/70 backdrop-blur-sm rounded-full p-1 shadow-lg border border-pink-100 w-full sm:w-auto max-w-md">
        {/* All Photos Tab */}
        <div className="relative flex-1 sm:flex-initial">
          {filter === 'all' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-md"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <button
            onClick={() => setFilter('all')}
            className={`relative z-10 px-4 sm:px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap w-full sm:w-auto text-sm sm:text-base ${filter === 'all'
              ? 'text-white shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
          >
            <motion.span
              animate={{
                scale: filter === 'all' ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">All Photos ({photosCount})</span>
              <span className="xs:hidden">All ({photosCount})</span>
            </motion.span>
          </button>
        </div>

        {/* Favorites Tab */}
        <div className="relative flex-1 sm:flex-initial">
          {filter === 'favorites' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-md"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <button
            onClick={() => setFilter('favorites')}
            className={`relative z-10 px-4 sm:px-6 py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap w-full sm:w-auto text-sm sm:text-base ${filter === 'favorites'
              ? 'text-white shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
          >
            <motion.span
              animate={{
                scale: filter === 'favorites' ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Heart
                className={`w-4 h-4 mr-2 transition-all duration-300 ${filter === 'favorites' ? 'fill-current' : ''
                  }`}
              />
              <span className="">Favorites ({favoritesCount})</span>
            </motion.span>
          </button>
        </div>
      </div>

      {/* Upload Button - Separate and more prominent */}
      <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[160px] lg:w-[180px]">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className={`w-full rounded-full px-6 py-3 sm:py-4 font-semibold shadow-lg transition-colors duration-300 hover:shadow-xl text-sm sm:text-base ${showUpload
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              } text-white border-0`}
          >
            <div className="flex items-center justify-center w-full">
              <motion.div
                animate={{ rotate: showUpload ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                className="mr-2 flex-shrink-0"
              >
                <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <span className="whitespace-nowrap text-center">
                <span className="hidden sm:inline">{showUpload ? 'Close Upload' : 'Add Photos'}</span>
                <span className="sm:hidden">{showUpload ? 'Close' : 'Upload'}</span>
              </span>
            </div>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}