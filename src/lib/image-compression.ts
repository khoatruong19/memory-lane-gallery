export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)

      // Try different quality levels to meet size requirement
      let currentQuality = quality
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const sizeKB = blob.size / 1024

            // If size is acceptable or quality is already very low, finish
            if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: Math.round((1 - blob.size / file.size) * 100)
              })
            } else {
              // Reduce quality and try again
              currentQuality = Math.max(0.1, currentQuality - 0.1)
              tryCompress()
            }
          },
          file.type,
          currentQuality
        )
      }

      tryCompress()
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file)
    
    // Clean up object URL after loading
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
    }
    
    img.addEventListener('load', cleanup, { once: true })
    img.addEventListener('error', cleanup, { once: true })
    
    img.src = objectUrl
  })
}

export async function compressMultipleImages(
  files: FileList,
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const result = await compressImage(file, options)
      results.push(result)
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error)
      // Return original file if compression fails
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      })
    }
  }
  
  return results
}