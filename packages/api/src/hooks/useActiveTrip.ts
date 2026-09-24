import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { Trip } from '@repo/domain'
import {
  MARK_ORDER_DELIVERED,
  MARK_ORDER_PICKUP,
  MY_TRIPS,
  RELEASE_ORDER,
  toTrip,
} from '../client/rider'
import { combineLoading } from '../utils/combineLoading'

interface UseActiveTripReturn {
  trip: Trip | null
  isLoading: boolean
  isMutating: boolean
  pickup: (orderId: string) => Promise<void>
  deliver: (orderId: string) => Promise<void>
  release: (orderId: string) => Promise<void>
}

interface MyTripsResult {
  myTrips: Record<string, unknown>[]
}

export const useActiveTrip = (): UseActiveTripReturn => {
  const { data, loading } = useQuery<MyTripsResult>(MY_TRIPS, {
    fetchPolicy: 'network-only',
  })

  const [pickupMutation, { loading: pickingUp }] = useMutation(MARK_ORDER_PICKUP)
  const [deliverMutation, { loading: delivering }] = useMutation(MARK_ORDER_DELIVERED)
  const [releaseMutation, { loading: releasing }] = useMutation(RELEASE_ORDER)

  const trips = (data?.myTrips ?? []).map(toTrip)
  const trip = trips.find((entry) => entry.status === 'ACTIVE') ?? null

  const pickup = useCallback(
    async (orderId: string) => {
      if (!trip) return
      await pickupMutation({
        variables: { tripId: trip.id, orderId },
        refetchQueries: [MY_TRIPS],
      })
    },
    [trip, pickupMutation],
  )

  const deliver = useCallback(
    async (orderId: string) => {
      if (!trip) return
      await deliverMutation({
        variables: { tripId: trip.id, orderId },
        refetchQueries: [MY_TRIPS],
      })
    },
    [trip, deliverMutation],
  )

  const release = useCallback(
    async (orderId: string) => {
      await releaseMutation({
        variables: { orderId },
        refetchQueries: [MY_TRIPS],
      })
    },
    [releaseMutation],
  )

  return {
    trip,
    isLoading: loading,
    isMutating: combineLoading(pickingUp, delivering, releasing),
    pickup,
    deliver,
    release,
  }
}
