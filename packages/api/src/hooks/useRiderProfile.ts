import { useCallback, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import type { RiderProfile, UpdateRiderProfileInput, UpdateVehicleInput } from '@repo/domain'
import {
  RIDER_PROFILE,
  SET_RIDER_AVAILABILITY,
  UPDATE_RIDER_LOCATION,
  UPDATE_RIDER_PROFILE,
  UPDATE_RIDER_VEHICLE,
  toRider,
} from '../client/rider'

interface UseRiderProfileReturn {
  profile: RiderProfile | null
  isLoading: boolean
  isMutating: boolean
  updateProfile: (input: UpdateRiderProfileInput) => Promise<void>
  updateVehicle: (input: UpdateVehicleInput) => Promise<void>
  setAvailability: (online: boolean) => Promise<void>
  updateLocation: (latitude: number, longitude: number) => Promise<void>
}

interface RiderProfileResult {
  riderProfile: Record<string, unknown> | null
}

export const useRiderProfile = (): UseRiderProfileReturn => {
  const { data, loading, refetch } = useQuery<RiderProfileResult>(RIDER_PROFILE)

  const [updateProfileMutation, { loading: updating }] = useMutation(UPDATE_RIDER_PROFILE)
  const [updateVehicleMutation, { loading: updatingVehicle }] = useMutation(UPDATE_RIDER_VEHICLE)
  const [setAvailabilityMutation, { loading: setting }] = useMutation(SET_RIDER_AVAILABILITY)
  const [updateLocationMutation] = useMutation(UPDATE_RIDER_LOCATION)

  const profile = useMemo(() => (data?.riderProfile ? toRider(data.riderProfile) : null), [data])

  const updateProfile = useCallback(
    async (input: UpdateRiderProfileInput) => {
      await updateProfileMutation({ variables: { input } })
      await refetch()
    },
    [updateProfileMutation, refetch],
  )

  const updateVehicle = useCallback(
    async (input: UpdateVehicleInput) => {
      await updateVehicleMutation({ variables: { input } })
      await refetch()
    },
    [updateVehicleMutation, refetch],
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
    profile,
    isLoading: loading,
    isMutating: updating || updatingVehicle || setting,
    updateProfile,
    updateVehicle,
    setAvailability,
    updateLocation,
  }
}
