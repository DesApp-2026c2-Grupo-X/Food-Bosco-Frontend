import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { useColorMode } from '@repo/components'
import { setSystemBarsTheme } from '../plugins/nativeBars'

export const useNativeSystemBars = () => {
  const { colorMode } = useColorMode()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    setSystemBarsTheme(colorMode === 'dark')
  }, [colorMode])
}
