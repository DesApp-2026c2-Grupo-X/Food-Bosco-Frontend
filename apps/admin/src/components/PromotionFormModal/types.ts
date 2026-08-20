import type { Promotion, PromotionInput } from '@repo/domain'

export interface PromotionFormModalProps {
  promotion: Promotion | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: PromotionInput) => Promise<void>
}
