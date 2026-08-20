import type { Category, CategoryInput } from '@repo/domain'

export interface CategoryFormModalProps {
  category: Category | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: CategoryInput) => Promise<void>
}
