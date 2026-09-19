import type { Order, TripOrder } from '@repo/domain'

export interface TripOrderCardProps {
  tripOrder: TripOrder
  order: Order | null
  isLoading?: boolean
  riderLocation?: { latitude: number; longitude: number } | null
  onPickup: () => void
  onDeliver: () => void
}
