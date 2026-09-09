import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { TripOffer } from '@repo/domain'
import {
  ACCEPT_TRIP_OFFER,
  MY_TRIPS,
  REJECT_TRIP_OFFER,
  TRIP_OFFERS,
  toTripOffer,
} from '../client/rider'

interface UseTripOffersReturn {
  offer: TripOffer | null
  isLoading: boolean
  isMutating: boolean
  accept: (offerId: string) => Promise<void>
  reject: (offerId: string) => Promise<void>
}

interface TripOffersResult {
  tripOffers: Record<string, unknown>[]
}

export const useTripOffers = (enabled = true): UseTripOffersReturn => {
  const { data, loading } = useQuery<TripOffersResult>(TRIP_OFFERS, {
    skip: !enabled,
    pollInterval: enabled ? 15000 : undefined,
  })

  const [acceptMutation, { loading: accepting }] = useMutation(ACCEPT_TRIP_OFFER)
  const [rejectMutation, { loading: rejecting }] = useMutation(REJECT_TRIP_OFFER)

  const offer = (data?.tripOffers ?? []).map(toTripOffer)[0] ?? null

  const accept = useCallback(
    async (offerId: string) => {
      await acceptMutation({
        variables: { offerId },
        refetchQueries: [MY_TRIPS, TRIP_OFFERS],
      })
    },
    [acceptMutation],
  )

  const reject = useCallback(
    async (offerId: string) => {
      await rejectMutation({
        variables: { offerId },
        refetchQueries: [TRIP_OFFERS],
      })
    },
    [rejectMutation],
  )

  return {
    offer,
    isLoading: loading,
    isMutating: accepting || rejecting,
    accept,
    reject,
  }
}
