import { useCallback, useEffect } from 'react'
import { playIncomingSound, unlockAudio } from '../playIncomingSound'
import type { UseAudioUnlockReturn } from '../types'

export const useAudioUnlock = (soundUrl: string): UseAudioUnlockReturn => {
  useEffect(() => {
    const handleGesture = () => unlockAudio(soundUrl)
    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
    }
  }, [soundUrl])

  const play = useCallback(() => playIncomingSound(soundUrl), [soundUrl])

  return { play }
}
