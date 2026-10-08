import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '@test/utils'

class FakeAudio {
  static instances: FakeAudio[] = []
  static rejectPlay = false

  src: string
  preload = ''
  currentTime = 0
  muted = false
  play = vi.fn(() =>
    FakeAudio.rejectPlay ? Promise.reject(new Error('blocked')) : Promise.resolve(),
  )
  pause = vi.fn()
  load = vi.fn()
  removeAttribute = vi.fn()
  private listeners = new Map<string, Set<(event: unknown) => void>>()

  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }

  addEventListener(type: string, callback: (event: unknown) => void) {
    const set = this.listeners.get(type) ?? new Set()
    set.add(callback)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, callback: (event: unknown) => void) {
    this.listeners.get(type)?.delete(callback)
  }
}

describe('playIncomingSound', () => {
  beforeEach(() => {
    vi.resetModules()
    FakeAudio.instances = []
    FakeAudio.rejectPlay = false
    vi.stubGlobal('Audio', FakeAudio)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retries on the next gesture when play is rejected', async () => {
    FakeAudio.rejectPlay = true
    const mod = await import('../AudioUnlock/playIncomingSound')

    mod.playIncomingSound()

    const audio = FakeAudio.instances[0]
    expect(audio.play).toHaveBeenCalledTimes(1)

    await Promise.resolve()

    window.dispatchEvent(new Event('pointerdown'))

    expect(audio.play).toHaveBeenCalledTimes(2)
  })

  it('releases and recreates the audio when the src changes', async () => {
    const mod = await import('../AudioUnlock/playIncomingSound')

    mod.playIncomingSound('/a.mp3')
    expect(FakeAudio.instances).toHaveLength(1)
    const first = FakeAudio.instances[0]

    mod.playIncomingSound('/b.mp3')
    expect(FakeAudio.instances).toHaveLength(2)
    expect(first.pause).toHaveBeenCalledTimes(1)
    expect(first.removeAttribute).toHaveBeenCalledWith('src')
    expect(first.load).toHaveBeenCalledTimes(1)

    mod.playIncomingSound('/b.mp3')
    expect(FakeAudio.instances).toHaveLength(2)
  })

  it('stops and clears the current audio', async () => {
    const mod = await import('../AudioUnlock/playIncomingSound')

    mod.playIncomingSound('/a.mp3')
    const first = FakeAudio.instances[0]

    mod.stopIncomingSound()
    expect(first.pause).toHaveBeenCalledTimes(1)
    expect(first.removeAttribute).toHaveBeenCalledWith('src')

    mod.playIncomingSound('/a.mp3')
    expect(FakeAudio.instances).toHaveLength(2)
  })
})

describe('useAudioUnlock', () => {
  beforeEach(() => {
    vi.resetModules()
    FakeAudio.instances = []
    FakeAudio.rejectPlay = false
    vi.stubGlobal('Audio', FakeAudio)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('registers and removes the unlock gesture listeners', async () => {
    const { useAudioUnlock } = await import('../AudioUnlock/hooks/useAudioUnlock')
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHookWithProviders(() => useAudioUnlock('/sound.mp3'))

    const pointer = addSpy.mock.calls.find(([type]) => type === 'pointerdown')
    const key = addSpy.mock.calls.find(([type]) => type === 'keydown')
    expect(pointer).toBeDefined()
    expect(key).toBeDefined()

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('pointerdown', pointer?.[1])
    expect(removeSpy).toHaveBeenCalledWith('keydown', key?.[1])
  })
})
