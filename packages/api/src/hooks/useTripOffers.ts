import { useCallback, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { Trip, TripOffer } from '@repo/domain'
import { getJson, postJson } from '../client/rest'
import { acceptOffer, getCurrentOffer, rejectOffer } from '../mocks/trips'

const KEY = '/api/trips/offers'

interface UseTripOffersReturn {
  offer: TripOffer | null
  isLoading: boolean
  isMutating: boolean
  accept: (offerId: string) => Promise<Trip | null>
  reject: (offerId: string) => Promise<void>
}

export const useTripOffers = (): UseTripOffersReturn => {
  const { data, isLoading, mutate } = useSWR<TripOffer | null>(
    KEY,
    async (url: string) => {
      const json = await getJson<TripOffer>(url)
      if (json && typeof json === 'object' && 'id' in json) return json
      return getCurrentOffer()
    },
    { refreshInterval: 15000 },
  )

  const [isMutating, setIsMutating] = useState(false)

  const accept = useCallback(
    async (offerId: string) => {
      setIsMutating(true)
      const trip = acceptOffer(offerId)
      await mutate(getCurrentOffer(), { revalidate: false })
      await postJson(`/api/trips/offers/${offerId}/accept`, {})
      await globalMutate('/api/trips/active', trip, false)
      setIsMutating(false)
      return trip
    },
    [mutate],
  )

  const reject = useCallback(
    async (offerId: string) => {
      setIsMutating(true)
      rejectOffer(offerId)
      await mutate(getCurrentOffer(), { revalidate: false })
      await postJson(`/api/trips/offers/${offerId}/reject`, {})
      setIsMutating(false)
    },
    [mutate],
  )

  return { offer: data ?? null, isLoading, isMutating, accept, reject }
}
