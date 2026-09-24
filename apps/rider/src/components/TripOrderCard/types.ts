import type { TripOrder } from '@repo/domain'

export interface TripOrderCardProps {
  tripOrder: TripOrder
  isLoading?: boolean
  riderLocation?: { latitude: number; longitude: number } | null
  onPickup: () => void
  onDeliver: () => void
}
