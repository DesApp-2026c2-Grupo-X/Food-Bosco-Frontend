import type { Order } from '@repo/domain'

export interface ReviewOrderModalProps {
  open: boolean
  order: Order
  onClose: () => void
  onSubmitted?: () => void
}
