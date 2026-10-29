import type { Order } from '@repo/domain'

export interface RepeatOrderModalProps {
  order: Order
  onClose: () => void
}
