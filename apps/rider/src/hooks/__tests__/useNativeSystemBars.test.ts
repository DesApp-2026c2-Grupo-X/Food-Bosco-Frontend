import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ colorMode: 'light' as 'light' | 'dark' | undefined }))
vi.mock('@repo/components', () => ({ useColorMode: () => ({ colorMode: state.colorMode }) }))

const capacitor = vi.hoisted(() => ({
  isNativePlatform: vi.fn(),
  getPlatform: vi.fn(),
}))
vi.mock('@capacitor/core', () => ({ Capacitor: capacitor }))

const statusBar = vi.hoisted(() => ({
  Style: { Light: 'LIGHT', Dark: 'DARK' },
  StatusBar: {
    setOverlaysWebView: vi.fn(),
    setStyle: vi.fn(),
    getInfo: vi.fn(),
  },
}))
vi.mock('@capacitor/status-bar', () => ({
  StatusBar: statusBar.StatusBar,
  Style: statusBar.Style,
}))

const nativeBars = vi.hoisted(() => ({ setSystemBarsTheme: vi.fn() }))
vi.mock('../../plugins/nativeBars', () => ({ setSystemBarsTheme: nativeBars.setSystemBarsTheme }))

import { useNativeSystemBars } from '../useNativeSystemBars'

describe('useNativeSystemBars', () => {
  beforeEach(() => {
    state.colorMode = 'light'
    document.documentElement.style.removeProperty('--ios-safe-top')
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--ios-safe-top')
  })

  it('does nothing when not running natively', () => {
    capacitor.isNativePlatform.mockReturnValue(false)

    renderHook(() => useNativeSystemBars())

    expect(statusBar.StatusBar.setOverlaysWebView).not.toHaveBeenCalled()
    expect(statusBar.StatusBar.setStyle).not.toHaveBeenCalled()
    expect(nativeBars.setSystemBarsTheme).not.toHaveBeenCalled()
  })

  it('sets the overlay, style and safe area on iOS', async () => {
    capacitor.isNativePlatform.mockReturnValue(true)
    capacitor.getPlatform.mockReturnValue('ios')
    statusBar.StatusBar.getInfo.mockResolvedValue({ height: 24 })

    renderHook(() => useNativeSystemBars())

    expect(statusBar.StatusBar.setOverlaysWebView).toHaveBeenCalledWith({ overlay: true })
    expect(statusBar.StatusBar.setStyle).toHaveBeenCalledWith({ style: 'LIGHT' })
    expect(nativeBars.setSystemBarsTheme).toHaveBeenCalledWith(false)
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue('--ios-safe-top')).toBe('24px'),
    )
  })

  it('uses the dark style in dark mode on iOS', () => {
    state.colorMode = 'dark'
    capacitor.isNativePlatform.mockReturnValue(true)
    capacitor.getPlatform.mockReturnValue('ios')
    statusBar.StatusBar.getInfo.mockResolvedValue({ height: 0 })

    renderHook(() => useNativeSystemBars())

    expect(statusBar.StatusBar.setStyle).toHaveBeenCalledWith({ style: 'DARK' })
    expect(nativeBars.setSystemBarsTheme).toHaveBeenCalledWith(true)
  })

  it('swallows getInfo rejections on iOS', async () => {
    capacitor.isNativePlatform.mockReturnValue(true)
    capacitor.getPlatform.mockReturnValue('ios')
    statusBar.StatusBar.getInfo.mockRejectedValue(new Error('nope'))

    renderHook(() => useNativeSystemBars())

    await waitFor(() => expect(statusBar.StatusBar.setStyle).toHaveBeenCalled())
    expect(document.documentElement.style.getPropertyValue('--ios-safe-top')).toBe('')
  })

  it.each(['android', 'web'] as const)('uses the themed system bars on %s', (platform) => {
    capacitor.isNativePlatform.mockReturnValue(true)
    capacitor.getPlatform.mockReturnValue(platform)

    renderHook(() => useNativeSystemBars())

    expect(nativeBars.setSystemBarsTheme).toHaveBeenCalledWith(false)
    expect(statusBar.StatusBar.setOverlaysWebView).not.toHaveBeenCalled()
  })
})
