import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useOrders } from '../useOrders'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = (id: string, status = 'PENDING') => ({
  id,
  number: id,
  clientId: 'c1',
  branchId: 'b1',
  branch: { id: 'b1', name: 'Centro' },
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status,
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
})

const pollIntervalFor = (
  spy: ReturnType<typeof vi.spyOn>,
  operationName: string,
): number | undefined => {
  const call = spy.mock.calls.find(
    ([options]) => options.query.definitions[0]?.name?.value === operationName,
  )
  return call?.[0].pollInterval
}

describe('useOrders', () => {
  it('maps the myOrders list', async () => {
    const testClient = createTestClient(() => ({
      data: { myOrders: [rawOrder('o1'), rawOrder('o2', 'DELIVERED')] },
    }))

    const { result } = renderHookWithProviders(() => useOrders(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.orders).toHaveLength(2))

    expect(result.current.orders[0].id).toBe('o1')
    expect(result.current.orders[1].status).toBe('DELIVERED')
  })

  it('returns an empty list when there are no orders', async () => {
    const testClient = createTestClient(() => ({ data: { myOrders: [] } }))
    const { result } = renderHookWithProviders(() => useOrders(), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.orders).toEqual([])
  })

  it('forwards pollIntervalMs to the query', async () => {
    const testClient = createTestClient(() => ({ data: { myOrders: [] } }))
    const spy = vi.spyOn(testClient.client, 'watchQuery')

    renderHookWithProviders(() => useOrders({ pollIntervalMs: 4321 }), {
      client: testClient.client,
    })

    await waitFor(() => expect(testClient.requestsByName('MyOrders').length).toBeGreaterThan(0))

    expect(pollIntervalFor(spy, 'MyOrders')).toBe(4321)
  })
})
