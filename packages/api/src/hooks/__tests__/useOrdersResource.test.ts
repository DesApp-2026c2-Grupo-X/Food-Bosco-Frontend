import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useOrdersResource } from '../useOrdersResource'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  number: '1001',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PENDING',
  total: 1500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

const setup = (
  filter?: { branchId?: string },
  orders: Record<string, unknown>[] = [rawOrder()],
) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'AdminOrders') {
      return { data: { orders } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useOrdersResource(filter), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useOrdersResource', () => {
  it('queries without variables when there is no filter', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminOrders'))).toEqual({})
    expect(result.current.orders).toHaveLength(1)
  })

  it('sends the branch filter as variables', async () => {
    const { testClient, result } = setup({ branchId: 'b1' })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminOrders'))).toEqual({
      filter: { branchId: 'b1' },
    })
  })

  it('maps raw orders to the domain model', async () => {
    const { result } = setup({ branchId: 'b1' })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orders[0]).toMatchObject({
      id: 'o1',
      number: '1001',
      branchId: 'b1',
      status: 'PENDING',
      total: 1500,
    })
  })

  it('returns an empty list when there are no orders', async () => {
    const { result } = setup(undefined, [])
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orders).toEqual([])
  })

  it('skips the query when the filter has no branchId', async () => {
    const { testClient, result } = setup({ branchId: undefined })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(testClient.requestsByName('AdminOrders')).toHaveLength(0)
    expect(result.current.orders).toEqual([])
  })
})
