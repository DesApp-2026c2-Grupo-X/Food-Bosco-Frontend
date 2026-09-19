import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useOrderTransition } from '../useOrderTransition'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: ['CONFIRMED', 'CANCELLED'],
}

const setup = (orderId: string | undefined) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'AdminOrder') return { data: { order: rawOrder } }
    return { data: { changeOrderStatus: rawOrder } }
  })
  const rendered = renderHookWithProviders(() => useOrderTransition(orderId), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useOrderTransition', () => {
  it('loads the order', async () => {
    const { result } = setup('o1')
    await waitFor(() => expect(result.current.order).not.toBeNull())
    expect(result.current.order?.status).toBe('PENDING')
  })

  it('requestChange opens the confirmation dialog with the pending status', async () => {
    const { result } = setup('o1')
    await act(async () => result.current.requestChange('CONFIRMED'))

    expect(result.current.nextStatus).toBe('CONFIRMED')
    expect(result.current.confirmOpen).toBe(true)
  })

  it('confirmChange sends the status and closes the dialog', async () => {
    const { testClient, result } = setup('o1')
    await waitFor(() => expect(result.current.order).not.toBeNull())

    await act(async () => result.current.requestChange('CONFIRMED'))
    await act(async () => {
      await result.current.confirmChange()
    })

    expect(operationVariables(testClient.lastRequest('ChangeOrderStatus'))).toEqual({
      orderId: 'o1',
      status: 'CONFIRMED',
    })
    expect(result.current.confirmOpen).toBe(false)
    expect(result.current.nextStatus).toBe('')
  })

  it('cancel closes the dialog without mutating', async () => {
    const { testClient, result } = setup('o1')
    await waitFor(() => expect(result.current.order).not.toBeNull())

    await act(async () => result.current.requestChange('CANCELLED'))
    await act(async () => result.current.cancel())

    expect(result.current.confirmOpen).toBe(false)
    expect(result.current.nextStatus).toBe('')
    expect(testClient.requestsByName('ChangeOrderStatus')).toHaveLength(0)
  })

  it('confirmChange without a pending status does nothing', async () => {
    const { testClient, result } = setup('o1')
    await waitFor(() => expect(result.current.order).not.toBeNull())

    await act(async () => {
      await result.current.confirmChange()
    })

    expect(testClient.requestsByName('ChangeOrderStatus')).toHaveLength(0)
  })

  it('does not query or mutate without an order id', async () => {
    const { testClient, result } = setup(undefined)
    await act(async () => {
      await result.current.confirmChange()
      result.current.requestChange('CONFIRMED')
      await result.current.confirmChange()
    })

    expect(testClient.requestsByName('AdminOrder')).toHaveLength(0)
    expect(testClient.requestsByName('ChangeOrderStatus')).toHaveLength(0)
  })
})
