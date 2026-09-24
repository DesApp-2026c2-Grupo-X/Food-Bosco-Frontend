import { act, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { OrderDetailPage } from '../index'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const rawOrder = (status: string) => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status,
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  branch: null,
  riderId: null,
  riderLocation: null,
})

const renderPage = (testClient: TestApolloClient) =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    </Routes>,
    { route: '/orders/o1', client: testClient.client },
  )

const setup = (status = 'CONFIRMED') => {
  const testClient = createTestClient(() => ({ data: { order: rawOrder(status) } }))
  renderPage(testClient)
  return testClient
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

describe('OrderDetailPage polling', () => {
  it('polls the order every 4 seconds while it is active', async () => {
    vi.useFakeTimers()
    const testClient = setup('CONFIRMED')

    await flush()
    expect(screen.getByText('Estado del pedido')).toBeInTheDocument()
    const baseline = testClient.requestsByName('Order').length

    await advance(3999)
    expect(testClient.requestsByName('Order')).toHaveLength(baseline)

    await advance(1)
    expect(testClient.requestsByName('Order')).toHaveLength(baseline + 1)
  })

  it('does not poll once the order is finished', async () => {
    vi.useFakeTimers()
    const testClient = setup('DELIVERED')

    await flush()
    expect(testClient.requestsByName('Order')).toHaveLength(1)

    await advance(12000)
    expect(testClient.requestsByName('Order')).toHaveLength(1)
  })

  it('stops polling when the order reaches a final status', async () => {
    vi.useFakeTimers()
    const statuses = ['CONFIRMED', 'CONFIRMED', 'DELIVERED']
    let call = 0
    const testClient = createTestClient(() => {
      const status = statuses[Math.min(call, statuses.length - 1)]
      call += 1
      return { data: { order: rawOrder(status) } }
    })
    renderPage(testClient)

    await flush()
    const baseline = testClient.requestsByName('Order').length

    await advance(4000)
    const afterTransition = testClient.requestsByName('Order').length
    expect(afterTransition).toBeGreaterThan(baseline)

    await advance(8000)
    expect(testClient.requestsByName('Order')).toHaveLength(afterTransition)
  })
})
