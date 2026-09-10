import type { OrderState } from '@repo/domain'

export const MOCK_ORDER_STATES: OrderState[] = [
  { code: 'PENDING', name: 'Pendiente', order: 1, active: true },
  { code: 'CONFIRMED', name: 'Confirmado', order: 2, active: true },
  { code: 'PREPARING', name: 'En preparación', order: 3, active: true },
  { code: 'READY_FOR_DELIVERY', name: 'Listo para entregar', order: 4, active: true },
  { code: 'ON_THE_WAY', name: 'En camino', order: 5, active: true },
  { code: 'DELIVERED', name: 'Entregado', order: 6, active: true },
  { code: 'CANCELLED', name: 'Cancelado', order: 7, active: true },
]
