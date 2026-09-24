import type { Order, OrderStatus } from '@repo/domain'
import { ATTENTION_ORDER_STATUSES } from '@repo/domain'

export interface AttentionGroup {
  status: OrderStatus
  orders: Order[]
}

export const groupAttentionOrders = (orders: Order[]): AttentionGroup[] =>
  ATTENTION_ORDER_STATUSES.map((status) => ({
    status,
    orders: orders.filter((order) => order.status === status),
  })).filter((group) => group.orders.length > 0)
