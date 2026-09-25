import { useState } from 'react'
import { useActiveTrip, useRiderProfile } from '@repo/api'
import { notifyError } from '@repo/components'
import { useRiderStore } from '../stores/riderStore'

export const useRideAvailability = () => {
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { setAvailability, isMutating } = useRiderProfile()
  const { trip } = useActiveTrip()
  const locked = trip != null
  const [submitting, setSubmitting] = useState(false)

  const toggle = async () => {
    if (locked || submitting) return

    const next = !isOnline
    setOnline(next)
    setSubmitting(true)
    try {
      await setAvailability(next)
    } catch {
      setOnline(!next)
      notifyError({ title: 'No pudimos actualizar tu disponibilidad' })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    available: isOnline,
    onToggle: toggle,
    isLoading: isMutating || submitting,
    locked,
  }
}
