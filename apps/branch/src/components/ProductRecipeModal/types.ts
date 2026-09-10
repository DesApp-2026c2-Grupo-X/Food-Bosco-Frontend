import type { BranchProduct } from '@repo/domain'

export interface ProductRecipeModalProps {
  product: BranchProduct | null
  onClose: () => void
}
