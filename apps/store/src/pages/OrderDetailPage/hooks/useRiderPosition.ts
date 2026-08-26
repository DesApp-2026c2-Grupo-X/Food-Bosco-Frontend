import { useEffect, useState } from 'react'

interface Position {
  lat: number
  lon: number
}

export const useRiderPosition = (from: Position, to: Position, enabled: boolean): Position => {
  const [progress, setProgress] = useState(0.3)

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => {
      setProgress((p) => Math.min(p + 0.12, 0.98))
    }, 3000)
    return () => clearInterval(id)
  }, [enabled])

  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lon: from.lon + (to.lon - from.lon) * progress,
  }
}
