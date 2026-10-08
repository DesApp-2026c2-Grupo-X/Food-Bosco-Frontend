import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useOrder } from '../useOrder'
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

const pollIntervalFor = (
  spy: ReturnType<typeof vi.spyOn>,
  operationName: string,
): number | undefined => {
  const call = spy.mock.calls.find(
    ([options]) => options.query.definitions[0]?.name?.value === operationName,
  )
  return call?.[0].pollInterval
}

describe('useOrder', () => {
  it('does not query when there is no id', async () => {
    const testClient = createTestClient(() => ({ data: { order: rawOrder } }))
    const { result } = renderHookWithProviders(() => useOrder(undefined), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('Order')).toHaveLength(0)
    expect(result.current.order).toBeNull()
  })

  it('maps the order and passes the id variable', async () => {
    const testClient = createTestClient(() => ({ data: { order: rawOrder } }))
    const { result } = renderHookWithProviders(() => useOrder('o1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.order).not.toBeNull())

    expect(result.current.order).toMatchObject({
      id: 'o1',
      number: '101',
      status: 'PENDING',
      total: 2500,
      availableTransitions: ['CONFIRMED'],
    })
    expect(operationVariables(testClient.lastRequest('Order'))).toEqual({ id: 'o1' })
  })

  it('forwards pollIntervalMs to the query', async () => {
    const testClient = createTestClient(() => ({ data: { order: rawOrder } }))
    const spy = vi.spyOn(testClient.client, 'watchQuery')

    const { result } = renderHookWithProviders(() => useOrder('o1', { pollIntervalMs: 1234 }), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.order).not.toBeNull())

    expect(pollIntervalFor(spy, 'Order')).toBe(1234)
  })
})
