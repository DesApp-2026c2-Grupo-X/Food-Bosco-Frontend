import type { TripOffer } from '@repo/domain'

export interface TripOfferCardProps {
  offer: TripOffer
  isLoading?: boolean
  onAccept: () => void
  onReject: () => void
}
