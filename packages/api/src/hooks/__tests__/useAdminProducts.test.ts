import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchResult } from '@apollo/client'
import { useAdminProducts } from '../useAdminProducts'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

const deferred = () => {
  let resolve!: (value: FetchResult) => void
  const promise = new Promise<FetchResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useAdminProducts', () => {
  it('maps rows and falls back to "Sin categoría" when there is no category name', async () => {
    const testClient = createTestClient(() => ({
      data: {
        products: [
          { ...rawProduct(), category: { id: 'c1', name: 'Comida', active: true } },
          { ...rawProduct({ id: 'p2', name: 'Agua' }), category: null },
          { ...rawProduct({ id: 'p3', name: 'Jugo' }), category: { id: 'c3', name: null } },
        ],
      },
    }))

    const { result } = renderHookWithProviders(() => useAdminProducts(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.products).toHaveLength(3))

    expect(result.current.products[0].categoryName).toBe('Comida')
    expect(result.current.products[0].product.name).toBe('Burger')
    expect(result.current.products[1].categoryName).toBe('Sin categoría')
    expect(result.current.products[2].categoryName).toBe('Sin categoría')
  })

  it('sends the setAvailable payload and refetches the list', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminProducts') {
        return { data: { products: [rawProduct()] } }
      }
      return { data: { setProductAvailable: rawProduct({ available: false }) } }
    })

    const { result } = renderHookWithProviders(() => useAdminProducts(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.products).toHaveLength(1))
    const before = testClient.requestsByName('AdminProducts').length

    await act(async () => {
      await result.current.setAvailable('p1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetProductAvailable'))).toEqual({
      id: 'p1',
      available: false,
    })
    expect(testClient.requestsByName('AdminProducts').length).toBeGreaterThan(before)
  })

  it('flags isToggling while the mutation is in flight', async () => {
    const pending = deferred()
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'SetProductAvailable') return pending.promise
      return { data: { products: [rawProduct()] } }
    })

    const { result } = renderHookWithProviders(() => useAdminProducts(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let request!: Promise<void>
    act(() => {
      request = result.current.setAvailable('p1', false)
    })

    await waitFor(() => expect(result.current.isToggling).toBe(true))

    await act(async () => {
      pending.resolve({ data: { setProductAvailable: rawProduct({ available: false }) } })
      await request
    })

    expect(result.current.isToggling).toBe(false)
  })
})
