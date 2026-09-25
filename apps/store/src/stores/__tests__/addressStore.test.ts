import { beforeEach, describe, expect, it } from 'vitest'
import { useAddressStore } from '../addressStore'

describe('addressStore', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: null })
  })

  it('selects and clears the active delivery address', () => {
    useAddressStore.getState().selectAddress('a1')
    expect(useAddressStore.getState().selectedAddressId).toBe('a1')

    useAddressStore.getState().clearAddress()
    expect(useAddressStore.getState().selectedAddressId).toBeNull()
  })

  it('persists the selection under the store-address key', () => {
    useAddressStore.getState().selectAddress('a2')
    const persisted = JSON.parse(localStorage.getItem('store-address') ?? '{}')
    expect(persisted.state.selectedAddressId).toBe('a2')
  })
})
