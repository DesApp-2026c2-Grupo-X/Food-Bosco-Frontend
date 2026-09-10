import { useQuery } from '@apollo/client'
import type { Trip } from '@repo/domain'
import { MY_TRIPS, toTrip } from '../client/rider'

interface UseMyTripsReturn {
  trips: Trip[]
  isLoading: boolean
}

interface MyTripsResult {
  myTrips: Record<string, unknown>[]
}

export const useMyTrips = (): UseMyTripsReturn => {
  const { data, loading } = useQuery<MyTripsResult>(MY_TRIPS, {
    fetchPolicy: 'network-only',
  })

  return {
    trips: (data?.myTrips ?? []).map(toTrip),
    isLoading: loading,
  }
}
