import { useRiderProfile } from '@repo/api'
import { useRiderStore } from '../stores/riderStore'

export const useRideAvailability = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { setAvailability, isMutating } = useRiderProfile()

  const toggle = async () => {
    const next = !isOnline
    setOnline(next)
    await setAvailability(next)
  }

  return { available: isOnline, onToggle: toggle, isLoading: isMutating }
}
