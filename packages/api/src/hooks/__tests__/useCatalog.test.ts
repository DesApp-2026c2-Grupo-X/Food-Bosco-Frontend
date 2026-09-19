import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCatalog } from '../useCatalog'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'Categories') {
      return { data: { categories: [{ id: 'c1', name: 'Comida', active: true }] } }
    }
    if (operation.operationName === 'Products') {
      return {
        data: {
          products: [
            {
              id: 'p1',
              name: 'Burger',
              price: 1000,
              available: true,
              configGroups: [],
              recipe: [],
            },
            {
              id: 'p2',
              name: 'Agotado',
              price: 500,
              available: false,
              configGroups: [],
              recipe: [],
            },
          ],
        },
      }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useCatalog(-34.6, -58.4), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useCatalog', () => {
  it('maps categories and hides unavailable products', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.categories.map((c) => c.name)).toEqual(['Comida'])
    expect(result.current.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('sends the current coordinates in the product filter', async () => {
    const { testClient } = setup()
    await act(async () => {
      await Promise.resolve()
    })
    expect(operationVariables(testClient.lastRequest('Products'))).toEqual({
      filter: { lat: -34.6, lng: -58.4 },
    })
  })

  it('sends nulls when no coordinates are available', async () => {
    const testClient = createTestClient(() => ({ data: { products: [], categories: [] } }))
    renderHookWithProviders(() => useCatalog(undefined, undefined), { client: testClient.client })
    await act(async () => {
      await Promise.resolve()
    })
    expect(operationVariables(testClient.lastRequest('Products'))).toEqual({
      filter: { lat: null, lng: null },
    })
  })
})
