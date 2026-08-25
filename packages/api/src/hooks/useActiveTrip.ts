import { useCallback, useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { Trip } from '@repo/domain'
import { getJson, postJson } from '../client/rest'
import { deliverOrder, getActiveTrip, pickupOrder } from '../mocks/trips'

const KEY = '/api/trips/active'

interface UseActiveTripReturn {
  trip: Trip | null
  isLoading: boolean
  isMutating: boolean
  pickup: (orderId: string) => Promise<Trip | null>
  deliver: (orderId: string) => Promise<Trip | null>
}

export const useActiveTrip = (): UseActiveTripReturn => {
  const { data, isLoading, mutate } = useSWR<Trip | null>(KEY, async (url: string) => {
    const json = await getJson<Trip>(url)
    if (json && typeof json === 'object' && 'id' in json) return json
    return getActiveTrip()
  })

  const [isMutating, setIsMutating] = useState(false)

  const pickup = useCallback(
    async (orderId: string) => {
      setIsMutating(true)
      const trip = data?.id ? pickupOrder(data.id, orderId) : null
      await mutate(trip, { revalidate: false })
      await postJson(`/api/trips/${data?.id}/orders/${orderId}/pickup`, {})
      setIsMutating(false)
      return trip
    },
    [data, mutate],
  )

  const deliver = useCallback(
    async (orderId: string) => {
      setIsMutating(true)
      const trip = data?.id ? deliverOrder(data.id, orderId) : null
      await mutate(getActiveTrip(), { revalidate: false })
      await postJson(`/api/trips/${data?.id}/orders/${orderId}/deliver`, {})
      await globalMutate('/api/trips')
      setIsMutating(false)
      return trip
    },
    [data, mutate],
  )

  return { trip: data ?? null, isLoading, isMutating, pickup, deliver }
}
