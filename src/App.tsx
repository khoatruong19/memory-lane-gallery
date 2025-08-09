import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Navigation } from '@/components/navigation'
import { TagFilter } from '@/components/tag-filter'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PhotoGrid } from '@/components/photo-grid'
import { UploadZone } from '@/components/upload-zone'
import { PhotoPreviewModal } from '@/components/photo-preview-modal'
import { EditPhotoModal } from '@/components/edit-photo-modal'
import { PhotoSkeleton } from '@/components/photo-skeleton'
import { usePhotos } from '@/hooks/use-photos'
import { useModal } from '@/hooks/use-modal'

function App() {
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null)

  // Custom hooks
  const { photos, isLoading, downloadingIds, handleUpload, handleToggleFavorite, handleDownload, handleDelete, handleEdit } = usePhotos()
  const {
    selectedPhoto,
    isModalOpen,
    handleImageClick,
    handleCloseModal,
    handleNextPhoto,
    handlePreviousPhoto,
    getNavigationProps
  } = useModal()

  // Apply both favorite and tag filters
  const filteredPhotos = photos
    .filter(photo => {
      // Apply favorite filter
      if (filter === 'favorites' && !photo.isFavorite) return false

      // Apply tag filter
      if (selectedTag && !photo.tags.includes(selectedTag)) return false

      return true
    })

  const onUpload = async (files: FileList, metadata: { description: string; tags: string[] }) => {
    await handleUpload(files, metadata)
    setShowUpload(false)
  }

  const onUploadClick = () => {
    setShowUpload(true)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
  }

  const handleClearFilters = () => {
    setFilter('all')
    setSelectedTag(null)
  }

  const handleEditPhoto = (photo: any) => {
    setEditingPhoto(photo)
  }

  const handleSaveEdit = async (photo: any, updates: { description: string; tags: string[] }) => {
    await handleEdit(photo, updates)
    setEditingPhoto(null)
  }

  const handleCloseEdit = () => {
    setEditingPhoto(null)
  }

  const navigationProps = getNavigationProps(filteredPhotos)

  // Show skeleton loader if photos are still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 ">
          <Header />
          <Navigation
            filter="all"
            setFilter={() => {}}
            showUpload={false}
            setShowUpload={() => {}}
            photosCount={0}
            favoritesCount={0}
          />
          <PhotoSkeleton count={8} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 ">
        <Header />

        <Navigation
          filter={filter}
          setFilter={setFilter}
          showUpload={showUpload}
          setShowUpload={setShowUpload}
          photosCount={photos.length}
          favoritesCount={photos.filter(p => p.isFavorite).length}
        />

        {/* Upload Zone */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <UploadZone onUpload={onUpload} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag Filter */}
        <TagFilter
          photos={photos}
          selectedTag={selectedTag}
          onTagClick={handleTagClick}
          onClearFilters={handleClearFilters}
        />

        {/* Photos Grid or Empty State */}
        {filteredPhotos.length > 0 ? (
          <PhotoGrid
            photos={filteredPhotos}
            onToggleFavorite={handleToggleFavorite}
            onImageClick={handleImageClick}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onTagClick={handleTagClick}
            downloadingIds={downloadingIds}
          />
        ) : (
          <EmptyState
            filter={filter}
            selectedTag={selectedTag}
            showUpload={showUpload}
            onUploadClick={onUploadClick}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Photo Preview Modal */}
        <PhotoPreviewModal
          isOpen={isModalOpen}
          photo={selectedPhoto}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          onEdit={handleEditPhoto}
          onDelete={handleDelete}
          onTagClick={handleTagClick}
          onNext={() => handleNextPhoto(filteredPhotos)}
          onPrevious={() => handlePreviousPhoto(filteredPhotos)}
          hasNext={navigationProps.hasNext}
          hasPrevious={navigationProps.hasPrevious}
        />

        {/* Edit Photo Modal */}
        <EditPhotoModal
          isOpen={!!editingPhoto}
          photo={editingPhoto}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  )
}

export default App