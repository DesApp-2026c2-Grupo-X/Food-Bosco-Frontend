import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { geocodeAddress } from '@repo/api'
import type { Address } from '@repo/domain'
import { useAddressFlow } from '../useAddressFlow'
import { useAddressStore } from '../../stores/addressStore'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  geocodeAddress: vi.fn(),
}))

const geocodeMock = geocodeAddress as unknown as Mock

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const existing: Address = { ...rawAddress }

const buildClient = (overrides: { createError?: Error; updateError?: Error } = {}) =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'CreateAddress':
        if (overrides.createError) return overrides.createError
        return { data: { createAddress: { ...rawAddress, id: 'a2' } } }
      case 'UpdateAddress':
        if (overrides.updateError) return overrides.updateError
        return { data: { updateAddress: rawAddress } }
      default:
        return { data: {} }
    }
  })

const defaultProps = {
  open: true,
  mode: 'manage' as const,
  editing: null,
  onSaved: vi.fn(),
  onSelect: vi.fn(),
}

describe('useAddressFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAddressStore.setState({ selectedAddressId: null })
    geocodeMock.mockResolvedValue({ lat: -34.6, lon: -58.4 })
  })

  it('opens on the list step in picker mode when addresses exist', async () => {
    const client = buildClient()
    const { result, rerender } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      { client: client.client, initialProps: { ...defaultProps, open: false, mode: 'picker' } },
    )

    await waitFor(() => expect(result.current.addresses).toHaveLength(1))
    rerender({ ...defaultProps, mode: 'picker' })

    await waitFor(() => expect(result.current.step).toBe('list'))
  })

  it('prefills the form when editing an address', async () => {
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: { ...defaultProps, editing: existing },
      },
    )

    await waitFor(() => expect(result.current.form.getValues('text')).toBe('Calle 1'))
    expect(result.current.editing).toBe(true)
  })

  it('geocodes valid input and moves to the confirmation step', async () => {
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: defaultProps,
      },
    )

    act(() => {
      result.current.form.setValue('text', 'av. santa fe')
      result.current.form.setValue('city', 'caba')
    })
    await act(async () => {
      await result.current.submitForm()
    })

    expect(geocodeAddress).toHaveBeenCalledWith('av. santa fe, caba')
    expect(result.current.step).toBe('confirm')
    expect(result.current.pending).toMatchObject({
      label: 'Dirección',
      text: 'Av. Santa Fe',
      city: 'Caba',
      latitude: -34.6,
      longitude: -58.4,
    })
  })

  it('shows an error when the address cannot be geocoded', async () => {
    geocodeMock.mockResolvedValue(null)
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: defaultProps,
      },
    )

    act(() => result.current.form.setValue('text', 'direccion inexistente'))
    await act(async () => {
      await result.current.submitForm()
    })

    expect(result.current.step).toBe('form')
    expect(result.current.error).toBe('No pudimos ubicar esa dirección. Revisá los datos.')
  })

  it('creates the address, selects it and reports it as saved', async () => {
    const onSaved = vi.fn()
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: { ...defaultProps, onSaved },
      },
    )

    act(() => result.current.form.setValue('text', 'calle nueva'))
    await act(async () => {
      await result.current.submitForm()
    })
    await act(async () => {
      await result.current.confirm()
    })

    expect(operationVariables(client.lastRequest('CreateAddress'))?.input).toMatchObject({
      text: 'Calle Nueva',
      latitude: -34.6,
      longitude: -58.4,
    })
    expect(useAddressStore.getState().selectedAddressId).toBe('a2')
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'a2' }))
  })

  it('updates an existing address and clears the saved selection', async () => {
    const onSaved = vi.fn()
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: { ...defaultProps, editing: existing, onSaved },
      },
    )
    await waitFor(() => expect(result.current.editing).toBe(true))

    await act(async () => {
      await result.current.submitForm()
    })
    await act(async () => {
      await result.current.confirm()
    })

    expect(operationVariables(client.lastRequest('UpdateAddress'))?.id).toBe('a1')
    expect(onSaved).toHaveBeenCalledWith(null)
  })

  it('shows a save error when creation fails', async () => {
    const client = buildClient({ createError: new Error('boom') })
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: defaultProps,
      },
    )

    act(() => result.current.form.setValue('text', 'calle nueva'))
    await act(async () => {
      await result.current.submitForm()
    })
    await act(async () => {
      await result.current.confirm()
    })

    expect(result.current.error).toBe('No pudimos guardar la dirección.')
  })

  it('selects an address and notifies the caller', async () => {
    const onSelect = vi.fn()
    const client = buildClient()
    const { result } = renderHookWithProviders(
      (props: typeof defaultProps) => useAddressFlow(props),
      {
        client: client.client,
        initialProps: { ...defaultProps, mode: 'picker', onSelect },
      },
    )

    act(() => result.current.select('a1'))

    expect(useAddressStore.getState().selectedAddressId).toBe('a1')
    expect(onSelect).toHaveBeenCalledWith('a1')
  })
})
