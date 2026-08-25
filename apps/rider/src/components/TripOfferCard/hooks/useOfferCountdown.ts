import { useEffect, useRef, useState } from 'react'

const secondsUntil = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000))

export const useOfferCountdown = (expiresAt: string, onExpire: () => void) => {
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt))
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    setRemaining(secondsUntil(expiresAt))

    const id = setInterval(() => {
      const next = secondsUntil(expiresAt)
      setRemaining(next)
      if (next <= 0) {
        clearInterval(id)
        onExpireRef.current()
      }
    }, 1000)

    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}
