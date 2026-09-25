import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOrder } from '../useOrder'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status: 'CONFIRMED',
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  branch: null,
  riderId: null,
  riderLocation: null,
}

const setup = (pollIntervalMs?: number) => {
  const testClient = createTestClient(() => ({ data: { order: rawOrder } }))
  const rendered = renderHookWithProviders(() => useOrder('o1', { pollIntervalMs }), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

const flush = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useOrder', () => {
  it('loads and maps the order', async () => {
    vi.useFakeTimers()
    const { result } = setup()

    await flush()
    expect(result.current.order?.id).toBe('o1')
    expect(result.current.order?.status).toBe('CONFIRMED')
    expect(result.current.isLoading).toBe(false)
  })

  it('polls at the configured interval', async () => {
    vi.useFakeTimers()
    const { testClient } = setup(4000)

    await flush()
    expect(testClient.requestsByName('Order')).toHaveLength(1)

    await advance(3999)
    expect(testClient.requestsByName('Order')).toHaveLength(1)

    await advance(1)
    expect(testClient.requestsByName('Order')).toHaveLength(2)
  })

  it('does not poll when the interval is zero', async () => {
    vi.useFakeTimers()
    const { testClient } = setup(0)

    await flush()
    expect(testClient.requestsByName('Order')).toHaveLength(1)

    await advance(12000)
    expect(testClient.requestsByName('Order')).toHaveLength(1)
  })
})
