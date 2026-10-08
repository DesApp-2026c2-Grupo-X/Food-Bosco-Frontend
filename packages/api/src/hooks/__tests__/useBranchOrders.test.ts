import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useBranchOrders } from '../useBranchOrders'
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

const setUser = (branchId?: string) =>
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'admin@b.com',
      role: 'branch_admin',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '1',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      branchId,
    },
  })

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'AdminOrders') {
      return { data: { orders: [rawOrder] } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useBranchOrders(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranchOrders', () => {
  afterEach(() => useAuthStore.setState({ user: null }))

  it('scopes the query to the branch of the authenticated user', async () => {
    setUser('b1')
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminOrders'))).toEqual({
      filter: { branchId: 'b1' },
    })
    expect(result.current.orders[0]?.branchId).toBe('b1')
  })

  it('skips the query when the user has no branch', async () => {
    setUser(undefined)
    const { testClient, result } = setup()
    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('AdminOrders')).toHaveLength(0)
    expect(result.current.orders).toEqual([])
  })
})
