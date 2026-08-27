import type { OrderStatus } from './order'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY_FOR_DELIVERY: 'Listo para entregar',
  ON_THE_WAY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const ORDER_STATUS_PALETTE = {
  PENDING: 'yellow',
  CONFIRMED: 'blue',
  PREPARING: 'orange',
  READY_FOR_DELIVERY: 'purple',
  ON_THE_WAY: 'blue',
  DELIVERED: 'green',
  CANCELLED: 'red',
} as const satisfies Record<OrderStatus, string>

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_DELIVERY: ['ON_THE_WAY', 'CANCELLED'],
  ON_THE_WAY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const getNextStatuses = (status: OrderStatus): OrderStatus[] =>
  ORDER_TRANSITIONS[status] ?? []

export const ATTENTION_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DELIVERY',
]
