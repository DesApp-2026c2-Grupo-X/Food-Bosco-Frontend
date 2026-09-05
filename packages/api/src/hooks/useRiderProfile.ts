import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { RiderProfile, UpdateRiderProfileInput } from '@repo/domain'
import {
  RIDER_PROFILE,
  SET_RIDER_AVAILABILITY,
  UPDATE_RIDER_LOCATION,
  UPDATE_RIDER_PROFILE,
  toRider,
} from '../client/rider'

interface UseRiderProfileReturn {
  profile: RiderProfile | null
  isLoading: boolean
  isMutating: boolean
  updateProfile: (input: UpdateRiderProfileInput) => Promise<void>
  setAvailability: (online: boolean) => Promise<void>
  updateLocation: (latitude: number, longitude: number) => Promise<void>
}

interface RiderProfileResult {
  riderProfile: Record<string, unknown> | null
}

export const useRiderProfile = (): UseRiderProfileReturn => {
  const { data, loading, refetch } = useQuery<RiderProfileResult>(RIDER_PROFILE)

  const [updateProfileMutation, { loading: updating }] = useMutation(UPDATE_RIDER_PROFILE)
  const [setAvailabilityMutation, { loading: setting }] = useMutation(SET_RIDER_AVAILABILITY)
  const [updateLocationMutation] = useMutation(UPDATE_RIDER_LOCATION)

  const updateProfile = useCallback(
    async (input: UpdateRiderProfileInput) => {
      await updateProfileMutation({ variables: { input } })
      await refetch()
    },
    [updateProfileMutation, refetch],
  )

  const setAvailability = useCallback(
    async (online: boolean) => {
      await setAvailabilityMutation({ variables: { online } })
      await refetch()
    },
    [setAvailabilityMutation, refetch],
  )

  const updateLocation = useCallback(
    async (latitude: number, longitude: number) => {
      await updateLocationMutation({ variables: { lat: latitude, lng: longitude } })
    },
    [updateLocationMutation],
  )

  return {
    profile: data?.riderProfile ? toRider(data.riderProfile) : null,
    isLoading: loading,
    isMutating: updating || setting,
    updateProfile,
    setAvailability,
    updateLocation,
  }
}
