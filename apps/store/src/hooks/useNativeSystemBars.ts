import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useColorMode } from '@repo/components'
import { setSystemBarsTheme } from '../plugins/nativeBars'

export const useNativeSystemBars = () => {
  const { colorMode } = useColorMode()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    if (Capacitor.getPlatform() === 'ios') {
      StatusBar.setOverlaysWebView({ overlay: true })
      StatusBar.setStyle({ style: colorMode === 'dark' ? Style.Dark : Style.Light })
      StatusBar.getInfo()
        .then((info) => {
          if (info.height) {
            document.documentElement.style.setProperty('--ios-safe-top', `${info.height}px`)
          }
        })
        .catch(() => {})
    }
    setSystemBarsTheme(colorMode === 'dark')
  }, [colorMode])
}
