export interface ImageUploadFieldProps {
  label: string
  required?: boolean
  invalid?: boolean
  errorText?: string
  value?: string | null
  onChange?: (value: string) => void
  onBlur?: () => void
  onUpload: (file: File) => Promise<string>
  isUploading?: boolean
}
