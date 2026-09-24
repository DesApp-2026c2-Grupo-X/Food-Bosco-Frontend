import type { Order } from '@repo/domain'

export interface IncomingOrderModalProps {
  order: Order | null
  onClose: () => void
}
