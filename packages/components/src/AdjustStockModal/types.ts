import type { BranchStock } from '@repo/domain'

export interface AdjustStockModalProps {
  ingredient: BranchStock | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (delta: number, reason: string) => Promise<void>
}
