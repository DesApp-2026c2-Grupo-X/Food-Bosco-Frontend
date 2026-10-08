import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProduct } from '../useProduct'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

describe('useProduct', () => {
  it('does not query when productId is undefined', async () => {
    const testClient = createTestClient(() => ({ data: { product: rawProduct } }))
    const { result } = renderHookWithProviders(() => useProduct(undefined), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('Product')).toHaveLength(0)
    expect(result.current.product).toBeNull()
  })

  it('maps the product and passes the id variable', async () => {
    const testClient = createTestClient(() => ({ data: { product: rawProduct } }))
    const { result } = renderHookWithProviders(() => useProduct('p1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.product).not.toBeNull())

    expect(result.current.product?.name).toBe('Burger')
    expect(result.current.product?.price).toBe(1000)
    expect(operationVariables(testClient.lastRequest('Product'))).toEqual({ id: 'p1' })
  })

  it('falls back to null when the api returns no product', async () => {
    const testClient = createTestClient(() => ({ data: { product: null } }))
    const { result } = renderHookWithProviders(() => useProduct('p1'), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.product).toBeNull()
  })
})
