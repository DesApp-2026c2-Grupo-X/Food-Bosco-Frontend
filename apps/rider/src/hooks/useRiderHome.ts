import { useCallback, useEffect, useRef, useState } from 'react'
import { useActiveTrip, useRiderProfile, useTripOffers } from '@repo/api'
import { playIncomingSound } from '@repo/components'
import { useRiderStore } from '../stores/riderStore'
import { useRiderLocation } from './useRiderLocation'

export const useRiderHome = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const { offer, isLoading, isMutating, accept, reject } = useTripOffers(isOnline)
  const {
    trip,
    isLoading: tripLoading,
    isMutating: tripMutating,
    pickup,
    deliver,
  } = useActiveTrip()
  const { updateLocation } = useRiderProfile()
  useRiderLocation(isOnline, updateLocation)
  const riderLocation = useRiderStore((state) => state.location)

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

  const handlePickup = useCallback(
    (orderId: string) => {
      void pickup(orderId)
    },
    [pickup],
  )

  const handleDeliver = useCallback(
    async (orderId: string) => {
      await deliver(orderId)
    },
    [deliver],
  )

  return {
    isOnline,
    visibleOffer,
    isLoading,
    isMutating,
    trip,
    tripLoading,
    tripMutating,
    riderLocation: riderLocation as { latitude: number; longitude: number } | null,
    handleAccept,
    handleReject,
    handlePickup,
    handleDeliver,
  }
}
