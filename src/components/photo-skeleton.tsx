import { motion } from "framer-motion"

interface PhotoSkeletonProps {
  count?: number
}

export function PhotoSkeleton({ count = 6 }: PhotoSkeletonProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative"
        >
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
            {/* Image Skeleton */}
            <div className="aspect-square relative bg-gray-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
            </div>

            {/* Info Section Skeleton */}
            <div className="p-3 sm:p-4">
              {/* Description Skeleton */}
              <div className="space-y-2 mb-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
              
              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-1">
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12" />
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-10" />
              </div>
            </div>

            {/* Favorite Button Skeleton */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}