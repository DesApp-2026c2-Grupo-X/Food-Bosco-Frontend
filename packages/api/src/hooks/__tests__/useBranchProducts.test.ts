import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useBranchProducts } from '../useBranchProducts'
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
  category: { id: 'c1', name: 'Comida', active: true },
  recipe: [],
}

const setUser = (branchId?: string) =>
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'admin@b.com',
      role: 'branch_admin',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '1',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      branchId,
    },
  })

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'BranchProducts') {
      return { data: { branchProducts: [rawProduct] } }
    }
    return { data: { setBranchProductAvailability: true } }
  })
  const rendered = renderHookWithProviders(() => useBranchProducts(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranchProducts', () => {
  afterEach(() => useAuthStore.setState({ user: null }))

  it('loads and maps the branch products', async () => {
    setUser('b1')
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('BranchProducts'))).toEqual({
      branchId: 'b1',
    })
    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0]).toMatchObject({
      categoryName: 'Comida',
      available: true,
    })
    expect(result.current.products[0]?.product.name).toBe('Burger')
  })

  it('sends the availability payload and refetches', async () => {
    setUser('b1')
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.setAvailability('p1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetBranchProductAvailability'))).toEqual({
      branchId: 'b1',
      productId: 'p1',
      available: false,
    })
    expect(testClient.requestsByName('BranchProducts')).toHaveLength(2)
  })

  it('does not query nor mutate when there is no branch', async () => {
    setUser(undefined)
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.setAvailability('p1', false)
    })

    expect(testClient.requestsByName('BranchProducts')).toHaveLength(0)
    expect(testClient.requestsByName('SetBranchProductAvailability')).toHaveLength(0)
    expect(result.current.products).toEqual([])
  })
})
