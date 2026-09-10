import { useEffect, useState } from 'react'
import { useRiderStore } from '../stores/riderStore'

export const useRiderLocation = (
  enabled: boolean,
  updateLocation: (latitude: number, longitude: number) => void,
): string | null => {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      setError('Geolocalización no disponible')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setError(null)
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        useRiderStore.getState().setLocation({ latitude, longitude })
        updateLocation(latitude, longitude)
      },
      () => setError('Ubicación no disponible'),
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [enabled, updateLocation])

  return error
}
