import { describe, expect, it, vi } from 'vitest'

const plugin = vi.hoisted(() => ({ setTheme: vi.fn() }))
vi.mock('@capacitor/core', () => ({ registerPlugin: vi.fn(() => plugin) }))

import { setSystemBarsTheme } from '../nativeBars'

describe('setSystemBarsTheme', () => {
  it('forwards the dark flag to the native plugin', () => {
    setSystemBarsTheme(true)

    expect(plugin.setTheme).toHaveBeenCalledWith({ dark: true })
  })

  it('forwards the light flag to the native plugin', () => {
    setSystemBarsTheme(false)

    expect(plugin.setTheme).toHaveBeenCalledWith({ dark: false })
  })
})
