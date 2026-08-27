import useSWR from 'swr'
import type { Trip } from '@repo/domain'
import { getJson } from '../client/rest'
import { getMyTrips } from '../mocks/trips'

const KEY = '/api/trips'

interface UseMyTripsReturn {
  trips: Trip[]
  isLoading: boolean
}

export const useMyTrips = (): UseMyTripsReturn => {
  const { data, isLoading } = useSWR<Trip[]>(KEY, async (url: string) => {
    const json = await getJson<Trip[]>(url)
    if (json && Array.isArray(json) && json.length > 0) return json
    return getMyTrips()
  })

  return { trips: data ?? [], isLoading }
}
