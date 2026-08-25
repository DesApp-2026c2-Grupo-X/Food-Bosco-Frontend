import { useCallback, useState } from 'react'
import useSWR from 'swr'
import type { RiderProfile, UpdateRiderProfileInput, UpdateVehicleInput } from '@repo/domain'
import { getJson, patchJson } from '../client/rest'
import { MOCK_RIDER_PROFILE } from '../mocks/rider'

const KEY = '/api/riders/me'

interface UseRiderProfileReturn {
  profile: RiderProfile | null
  isLoading: boolean
  isMutating: boolean
  updateProfile: (input: UpdateRiderProfileInput) => Promise<void>
  updateVehicle: (input: UpdateVehicleInput) => Promise<void>
  setAvailability: (online: boolean) => Promise<void>
  updateLocation: (latitude: number, longitude: number) => Promise<void>
}

export const useRiderProfile = (): UseRiderProfileReturn => {
  const { data, isLoading, mutate } = useSWR<RiderProfile>(KEY, async (url: string) => {
    const json = await getJson<RiderProfile>(url)
    if (json && typeof json === 'object' && 'id' in json) return json
    return MOCK_RIDER_PROFILE
  })

  const [isMutating, setIsMutating] = useState(false)

  const updateProfile = useCallback(
    async (input: UpdateRiderProfileInput) => {
      setIsMutating(true)
      Object.assign(MOCK_RIDER_PROFILE, input)
      await mutate({ ...MOCK_RIDER_PROFILE }, { revalidate: false })
      await patchJson(KEY, input)
      setIsMutating(false)
    },
    [mutate],
  )

  const updateVehicle = useCallback(
    async (input: UpdateVehicleInput) => {
      setIsMutating(true)
      const vehicle =
        input.type === 'moto'
          ? {
              type: 'moto' as const,
              marca: input.marca,
              modelo: input.modelo,
              patente: input.patente,
            }
          : { type: 'bici' as const }
      MOCK_RIDER_PROFILE.vehicle = vehicle
      await mutate({ ...MOCK_RIDER_PROFILE }, { revalidate: false })
      await patchJson(`${KEY}/vehicle`, input)
      setIsMutating(false)
    },
    [mutate],
  )

  const setAvailability = useCallback(
    async (online: boolean) => {
      setIsMutating(true)
      MOCK_RIDER_PROFILE.available = online
      await mutate({ ...MOCK_RIDER_PROFILE }, { revalidate: false })
      await patchJson(`${KEY}/availability`, { available: online })
      setIsMutating(false)
    },
    [mutate],
  )

  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    MOCK_RIDER_PROFILE.currentLocation = { latitude, longitude }
    await patchJson(`${KEY}/location`, { latitude, longitude })
  }, [])

  return {
    profile: data ?? null,
    isLoading,
    isMutating,
    updateProfile,
    updateVehicle,
    setAvailability,
    updateLocation,
  }
}
