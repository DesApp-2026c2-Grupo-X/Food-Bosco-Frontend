import type { OrderState, OrderStateInput } from '@repo/domain'

export interface OrderStateFormModalProps {
  state: OrderState | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: OrderStateInput) => Promise<void>
}
