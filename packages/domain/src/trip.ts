import type { OrderStatus } from './order'
import type { GeoPoint } from './rider'

export type TripStatus = 'OFFERED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  OFFERED: 'Ofrecido',
  ACTIVE: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export interface TripAddress {
  text: string
  latitude: number
  longitude: number
}

export interface TripOrder {
  orderId: string
  pickupBranchId: string
  pickupLocation: GeoPoint
  deliveryAddress: TripAddress
  status: OrderStatus
  pickedUpAt: string | null
  deliveredAt: string | null
}

export interface TripOffer {
  id: string
  orderCount: number
  distanceKm: number
  estimatedMinutes: number
  estimatedEarnings: number
  expiresAt: string | null
}

export interface Trip {
  id: string
  riderId: string
  status: TripStatus
  orders: TripOrder[]
  distanceKm: number
  estimatedMinutes: number
  estimatedEarnings: number
  earnings: number | null
  startedAt: string | null
  completedAt: string | null
  expiresAt: string | null
}
