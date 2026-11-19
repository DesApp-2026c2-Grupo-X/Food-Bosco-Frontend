import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'
import { useHomeFeed } from '../useHomeFeed'

const rawFeed = {
  generatedAt: '2026-11-18T03:00:00.000Z',
  hasHistory: true,
  topCategory: { id: 'c1', name: 'Hamburguesas', active: true },
  favoriteBranch: null,
  nearestBranch: null,
  categories: [{ id: 'c1', name: 'Hamburguesas', active: true }],
  forYou: [
    {
      product: {
        id: 'p1',
        categoryId: 'c1',
        name: 'Burger',
        description: 'Clásica',
        price: 1000,
        image: null,
        available: true,
        configGroups: [],
        recipe: [],
      },
      reason: 'REPEAT',
      hint: 'Ya lo pediste',
      score: 5.25,
    },
  ],
  discovery: [],
  reorder: [],
  promotions: [],
}

const setup = (options?: Parameters<typeof useHomeFeed>[0]) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'HomeFeed') {
      return { data: { homeFeed: rawFeed } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useHomeFeed(options), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useHomeFeed', () => {
  it('carga y mapea el feed', async () => {
    const { result } = setup({ lat: -34.6, lng: -58.4 })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.feed?.hasHistory).toBe(true)
    expect(result.current.feed?.forYou[0].reason).toBe('REPEAT')
    expect(result.current.error).toBeUndefined()
  })

  it('envía addressId y coordenadas al backend', async () => {
    const { testClient } = setup({ addressId: 'a1', lat: -34.6, lng: -58.4 })
    await waitFor(() => expect(testClient.lastRequest('HomeFeed')).toBeDefined())

    expect(operationVariables(testClient.lastRequest('HomeFeed'))).toEqual({
      input: { addressId: 'a1', lat: -34.6, lng: -58.4 },
    })
  })

  it('no ejecuta la query cuando el flag está apagado', () => {
    const { testClient, result } = setup({ enabled: false })

    expect(testClient.requestsByName('HomeFeed')).toHaveLength(0)
    expect(result.current.feed).toBeNull()
  })
})
