import type { OrderItem } from '@repo/domain'

export interface OrderItemsCardProps {
  items: OrderItem[]
  title?: string
}
