import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Address } from '@repo/domain'
import { useAddressForm } from '../useAddressForm'
import { renderHookWithProviders } from '@test/utils'

const address: Address = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

describe('useAddressForm', () => {
  it('starts closed without an editing address', () => {
    const { result } = renderHookWithProviders(() => useAddressForm())

    expect(result.current.open).toBe(false)
    expect(result.current.editing).toBeNull()
  })

  it('opens the create flow', () => {
    const { result } = renderHookWithProviders(() => useAddressForm())

    act(() => result.current.openCreate())

    expect(result.current.open).toBe(true)
    expect(result.current.editing).toBeNull()
  })

  it('opens the edit flow with the address', () => {
    const { result } = renderHookWithProviders(() => useAddressForm())

    act(() => result.current.openEdit(address))

    expect(result.current.open).toBe(true)
    expect(result.current.editing).toEqual(address)
  })

  it('closes the sheet', () => {
    const { result } = renderHookWithProviders(() => useAddressForm())

    act(() => result.current.openCreate())
    act(() => result.current.close())

    expect(result.current.open).toBe(false)
  })
})
