import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCartCount } from '../useCartCount'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

describe('useCartCount', () => {
  it('counts all units in the cart, not lines', async () => {
    const client = createTestClient(() => ({
      data: {
        myCart: {
          id: 'cart',
          clientId: 'c1',
          status: 'OPEN',
          total: 0,
          items: [
            { id: 'i1', productId: 'p1', quantity: 2, optionIds: [], options: [] },
            { id: 'i2', productId: 'p2', quantity: 3, optionIds: [], options: [] },
          ],
        },
      },
    }))

    const { result } = renderHookWithProviders(() => useCartCount(), { client: client.client })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.count).toBe(5)
  })

  it('reports zero while the cart is empty', async () => {
    const client = createTestClient(() => ({ data: { myCart: null } }))
    const { result } = renderHookWithProviders(() => useCartCount(), { client: client.client })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.count).toBe(0)
  })
})
