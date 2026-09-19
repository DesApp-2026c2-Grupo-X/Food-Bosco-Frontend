import { useCallback, useState } from 'react'
import { uploadProductImage } from '../client/uploads'

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string>
  isUploading: boolean
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      return await uploadProductImage(file)
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { uploadImage, isUploading }
}
