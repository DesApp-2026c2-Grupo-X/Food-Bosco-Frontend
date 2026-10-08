import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGlobalOrders } from '../useGlobalOrders'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = {
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
}

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'AdminOrders') {
      return { data: { orders: [rawOrder] } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useGlobalOrders(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useGlobalOrders', () => {
  it('loads every order without variables', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminOrders'))).toEqual({})
    expect(result.current.orders).toHaveLength(1)
    expect(result.current.orders[0]?.id).toBe('o1')
  })
})
