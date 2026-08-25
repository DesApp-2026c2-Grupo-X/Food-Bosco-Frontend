import { useEffect, useState } from 'react'

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
        updateLocation(position.coords.latitude, position.coords.longitude)
      },
      () => setError('Ubicación no disponible'),
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [enabled, updateLocation])

  return error
}
