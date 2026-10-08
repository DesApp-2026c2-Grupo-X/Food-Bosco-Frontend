import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchResult } from '@apollo/client'
import { useAdminOrder } from '../useAdminOrder'
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

describe('useAdminOrder', () => {
  it('maps the order', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminOrder') {
        return { data: { order: rawOrder } }
      }
      return { data: {} }
    })

    const { result } = renderHookWithProviders(() => useAdminOrder('o1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.order).not.toBeNull())

    expect(result.current.order).toMatchObject({ id: 'o1', status: 'PENDING', total: 2500 })
    expect(operationVariables(testClient.lastRequest('AdminOrder'))).toEqual({ id: 'o1' })
  })

  it('sends the status payload and refetches the order', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminOrder') {
        return { data: { order: rawOrder } }
      }
      return { data: { changeOrderStatus: { ...rawOrder, status: 'CONFIRMED' } } }
    })

    const { result } = renderHookWithProviders(() => useAdminOrder('o1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.order).not.toBeNull())
    const before = testClient.requestsByName('AdminOrder').length

    await act(async () => {
      await result.current.changeStatus('CONFIRMED')
    })

    expect(operationVariables(testClient.lastRequest('ChangeOrderStatus'))).toEqual({
      orderId: 'o1',
      status: 'CONFIRMED',
    })
    expect(testClient.requestsByName('AdminOrder').length).toBeGreaterThan(before)
  })

  it('flags isMutating while the mutation is in flight', async () => {
    const pending = deferred()
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'ChangeOrderStatus') return pending.promise
      return { data: { order: rawOrder } }
    })

    const { result } = renderHookWithProviders(() => useAdminOrder('o1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let request!: Promise<void>
    act(() => {
      request = result.current.changeStatus('CONFIRMED')
    })

    await waitFor(() => expect(result.current.isMutating).toBe(true))

    await act(async () => {
      pending.resolve({ data: { changeOrderStatus: { ...rawOrder, status: 'CONFIRMED' } } })
      await request
    })

    expect(result.current.isMutating).toBe(false)
  })

  it('does not mutate when there is no order id', async () => {
    const testClient = createTestClient(() => ({ data: { order: rawOrder } }))
    const { result } = renderHookWithProviders(() => useAdminOrder(undefined), {
      client: testClient.client,
    })

    await act(async () => {
      await result.current.changeStatus('CONFIRMED')
    })

    expect(testClient.requestsByName('AdminOrder')).toHaveLength(0)
    expect(testClient.requestsByName('ChangeOrderStatus')).toHaveLength(0)
  })
})
