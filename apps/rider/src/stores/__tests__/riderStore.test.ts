import { beforeEach, describe, expect, it } from 'vitest'
import { useRiderStore } from '../riderStore'

describe('riderStore', () => {
  beforeEach(() => {
    useRiderStore.setState({ isOnline: true, location: null })
  })

  it('toggles the online flag', () => {
    useRiderStore.getState().setOnline(false)
    expect(useRiderStore.getState().isOnline).toBe(false)
  })

  it('stores the latest location', () => {
    useRiderStore.getState().setLocation({ latitude: -34.6, longitude: -58.4 })
    expect(useRiderStore.getState().location).toEqual({ latitude: -34.6, longitude: -58.4 })
  })

  it('persists only the online flag', () => {
    useRiderStore.getState().setOnline(false)
    useRiderStore.getState().setLocation({ latitude: 1, longitude: 2 })

    const persisted = JSON.parse(localStorage.getItem('rider') ?? '{}')
    expect(persisted.state.isOnline).toBe(false)
    expect(persisted.state.location).toBeUndefined()
  })
})
