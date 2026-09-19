import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchResult } from '@apollo/client'
import { useCreateOrder } from '../useCreateOrder'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: { id: 'b1', name: 'Centro' },
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: ['CONFIRMED'],
}

const deferred = () => {
  let resolve!: (value: FetchResult) => void
  const promise = new Promise<FetchResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useCreateOrder', () => {
  it('sends the selected address and maps the created order', async () => {
    const testClient = createTestClient(() => ({ data: { createOrder: rawOrder } }))
    const { result } = renderHookWithProviders(() => useCreateOrder(), {
      client: testClient.client,
    })

    let created: unknown
    await act(async () => {
      created = await result.current.createOrder('addr-9')
    })

    expect(operationVariables(testClient.lastRequest('CreateOrder'))).toEqual({
      addressId: 'addr-9',
    })
    expect(created).toMatchObject({ id: 'o1', number: '101', status: 'PENDING', total: 2500 })
  })

  it('returns null when the API responds without an order', async () => {
    const testClient = createTestClient(() => ({ data: { createOrder: null } }))
    const { result } = renderHookWithProviders(() => useCreateOrder(), {
      client: testClient.client,
    })

    let created: unknown = 'sentinel'
    await act(async () => {
      created = await result.current.createOrder('addr-1')
    })

    expect(created).toBeNull()
  })

  it('toggles the loading flag around the request', async () => {
    const pending = deferred()
    const testClient = createTestClient(() => pending.promise)
    const { result } = renderHookWithProviders(() => useCreateOrder(), {
      client: testClient.client,
    })

    expect(result.current.isLoading).toBe(false)

    let request!: Promise<unknown>
    act(() => {
      request = result.current.createOrder('addr-1')
    })

    await waitFor(() => expect(result.current.isLoading).toBe(true))

    await act(async () => {
      pending.resolve({ data: { createOrder: rawOrder } })
      await request
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('resets loading and rethrows when the API fails', async () => {
    const testClient = createTestClient(() => new Error('network'))
    const { result } = renderHookWithProviders(() => useCreateOrder(), {
      client: testClient.client,
    })

    await expect(
      act(async () => {
        await result.current.createOrder('addr-1')
      }),
    ).rejects.toThrow('network')

    expect(result.current.isLoading).toBe(false)
  })
})
