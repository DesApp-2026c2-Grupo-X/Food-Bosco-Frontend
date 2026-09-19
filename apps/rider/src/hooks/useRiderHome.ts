import { useCallback, useEffect, useRef, useState } from 'react'
import { useActiveTrip, useRiderProfile, useTripOffers } from '@repo/api'
import { playIncomingSound } from '@repo/components'
import { useRiderStore } from '../stores/riderStore'
import { useRiderLocation } from './useRiderLocation'

export const useRiderHome = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const { offer, isLoading, isMutating, accept, reject } = useTripOffers(isOnline)
  const { trip, isLoading: tripLoading } = useActiveTrip()
  const { updateLocation } = useRiderProfile()
  useRiderLocation(isOnline, updateLocation)

  const [dismissedOfferId, setDismissedOfferId] = useState<string | null>(null)
  const visibleOffer = offer && offer.id !== dismissedOfferId ? offer : null

  const previousOfferId = useRef<string | null>(null)

  useEffect(() => {
    const offerId = offer?.id ?? null
    if (offerId !== null && offerId !== previousOfferId.current) {
      playIncomingSound()
    }
    previousOfferId.current = offerId
  }, [offer])

  const handleAccept = useCallback(async () => {
    if (!offer) return
    await accept(offer.id)
  }, [offer, accept])

  const handleReject = useCallback(() => {
    if (!offer) return
    setDismissedOfferId(offer.id)
    void reject(offer.id).catch(() => undefined)
  }, [offer, reject])

  return {
    isOnline,
    visibleOffer,
    isLoading,
    isMutating,
    trip,
    tripLoading,
    handleAccept,
    handleReject,
  }
}
