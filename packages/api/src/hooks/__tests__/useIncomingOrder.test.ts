import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIncomingOrder } from '../useIncomingOrder'
import { useAuthStore } from '../../stores/authStore'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const order = (id: string, number: string) => ({
  id,
  number,
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
})

const setUser = (branchId?: string) => {
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'a@b.com',
      role: 'branch_admin',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '1',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      branchId,
    },
  })
}

describe('useIncomingOrder', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    useAuthStore.setState({ user: null })
  })

  it('scopes the poll to the user branch and pending status', async () => {
    setUser('b1')
    const testClient = createTestClient(() => ({ data: { orders: [order('o1', '1')] } }))
    renderHookWithProviders(() => useIncomingOrder(), { client: testClient.client })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(operationVariables(testClient.lastRequest('AdminOrders'))).toEqual({
      filter: { branchId: 'b1', status: 'PENDING' },
    })
  })

  it('does not poll without a branch', async () => {
    setUser(undefined)
    const testClient = createTestClient(() => ({ data: { orders: [] } }))
    renderHookWithProviders(() => useIncomingOrder(), { client: testClient.client })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })
    expect(testClient.requestsByName('AdminOrders')).toHaveLength(0)
  })

  it('ignores the first batch and surfaces only genuinely new orders', async () => {
    setUser('b1')
    let call = 0
    const testClient = createTestClient(() => {
      call += 1
      return {
        data: { orders: call === 1 ? [order('o1', '1')] : [order('o1', '1'), order('o2', '2')] },
      }
    })
    const { result } = renderHookWithProviders(() => useIncomingOrder(), {
      client: testClient.client,
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(result.current.incoming).toBeNull()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(result.current.incoming?.id).toBe('o2')

    act(() => result.current.acknowledge())
    expect(result.current.incoming).toBeNull()
  })
})
