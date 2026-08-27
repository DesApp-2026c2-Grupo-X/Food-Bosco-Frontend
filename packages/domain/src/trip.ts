import type { Order } from './order'

export type TripStatus = 'OFFERED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  OFFERED: 'Ofrecido',
  ACTIVE: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export interface TripOrder {
  order: Order
  pickedUp: boolean
  delivered: boolean
}

export interface TripOffer {
  id: string
  orders: Order[]
  distanceKm: number
  estimatedMinutes: number
  estimatedEarnings: number
  expiresAt: string
}

export interface Trip {
  id: string
  riderId: string
  status: TripStatus
  orders: TripOrder[]
  distanceKm?: number
  startedAt?: string
  completedAt?: string
  earnings?: number
}
