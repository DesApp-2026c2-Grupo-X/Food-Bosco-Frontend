import type { TripOrder } from '@repo/domain'

export interface TripOrderCardProps {
  tripOrder: TripOrder
  isLoading?: boolean
  onPickup: () => void
  onDeliver: () => void
}
