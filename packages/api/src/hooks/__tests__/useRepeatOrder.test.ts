import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRepeatOrder } from '../useRepeatOrder'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawResult = {
  cart: {
    id: 'cart2',
    clientId: 'c1',
    status: 'OPEN',
    total: 340,
    items: [],
  },
  skippedItems: [{ productId: 'p2', name: 'Papas', reason: 'PRODUCT_UNAVAILABLE' }],
  priceChanges: [
    {
      productId: 'p1',
      name: 'Burger',
      quantity: 2,
      previousUnitPrice: 100,
      currentUnitPrice: 170,
    },
  ],
}

describe('useRepeatOrder', () => {
  it('sends the order id and maps the repeat result', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'RepeatOrder') {
        return { data: { repeatOrder: rawResult } }
      }
      return { data: {} }
    })

    const { result } = renderHookWithProviders(() => useRepeatOrder(), {
      client: testClient.client,
    })

    let repeated: Awaited<ReturnType<typeof result.current.repeatOrder>> = null

    await act(async () => {
      repeated = await result.current.repeatOrder('o1')
    })

    expect(operationVariables(testClient.lastRequest('RepeatOrder'))).toEqual({ orderId: 'o1' })
    expect(repeated?.cart.total).toBe(340)
    expect(repeated?.skippedItems).toEqual([
      { productId: 'p2', name: 'Papas', reason: 'PRODUCT_UNAVAILABLE' },
    ])
    expect(repeated?.priceChanges[0]).toMatchObject({
      previousUnitPrice: 100,
      currentUnitPrice: 170,
    })
  })

  it('returns null when the API returns no result', async () => {
    const testClient = createTestClient(() => ({ data: { repeatOrder: null } }))

    const { result } = renderHookWithProviders(() => useRepeatOrder(), {
      client: testClient.client,
    })

    let repeated: Awaited<ReturnType<typeof result.current.repeatOrder>> = null

    await act(async () => {
      repeated = await result.current.repeatOrder('missing')
    })

    expect(repeated).toBeNull()
  })

  it('propagates API errors to the caller', async () => {
    const testClient = createTestClient(() => new Error('boom'))

    const { result } = renderHookWithProviders(() => useRepeatOrder(), {
      client: testClient.client,
    })

    await expect(
      act(async () => {
        await result.current.repeatOrder('o1')
      }),
    ).rejects.toThrow('boom')
  })
})
