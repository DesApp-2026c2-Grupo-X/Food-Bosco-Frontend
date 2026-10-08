import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FetchResult } from '@apollo/client'
import { useProductReports } from '../useProductReports'
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

const rawCategory = { id: 'c1', name: 'Comida', active: true }

const rawReportRow = {
  position: 1,
  product: rawProduct,
  category: rawCategory,
  quantity: 5,
  revenue: 5000,
}

const rawOutOfStockRow = { product: rawProduct, category: rawCategory, quantity: 0 }

const deferred = () => {
  let resolve!: (value: FetchResult) => void
  const promise = new Promise<FetchResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useProductReports', () => {
  it('maps each list with its own mapper and forwards the same filter', async () => {
    const testClient = createTestClient((operation) => {
      switch (operation.operationName) {
        case 'BestSellingProducts':
          return { data: { bestSellingProducts: [rawReportRow] } }
        case 'LeastSoldProducts':
          return { data: { leastSoldProducts: [rawReportRow] } }
        case 'OutOfStockProducts':
          return { data: { outOfStockProducts: [rawOutOfStockRow] } }
        case 'HighestRevenueProducts':
          return { data: { highestRevenueProducts: [rawReportRow] } }
        default:
          return { data: {} }
      }
    })

    const { result } = renderHookWithProviders(() => useProductReports({ from: '2025-01-01' }), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.bestSellers).toHaveLength(1))

    expect(result.current.bestSellers[0].product.name).toBe('Burger')
    expect(result.current.bestSellers[0].revenue).toBe(5000)
    expect(result.current.leastSold[0].position).toBe(1)
    expect(result.current.outOfStock[0].quantity).toBe(0)
    expect(result.current.highestRevenue[0].product.id).toBe('p1')

    for (const operationName of [
      'BestSellingProducts',
      'LeastSoldProducts',
      'OutOfStockProducts',
      'HighestRevenueProducts',
    ]) {
      expect(operationVariables(testClient.lastRequest(operationName))).toEqual({
        filter: { from: '2025-01-01' },
      })
    }
  })

  it('is loading while any of the four queries is still pending', async () => {
    const pending = deferred()
    const testClient = createTestClient((operation) => {
      switch (operation.operationName) {
        case 'BestSellingProducts':
          return { data: { bestSellingProducts: [rawReportRow] } }
        case 'LeastSoldProducts':
          return { data: { leastSoldProducts: [rawReportRow] } }
        case 'HighestRevenueProducts':
          return { data: { highestRevenueProducts: [rawReportRow] } }
        case 'OutOfStockProducts':
          return pending.promise
        default:
          return { data: {} }
      }
    })

    const { result } = renderHookWithProviders(() => useProductReports(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.bestSellers).toHaveLength(1))
    await waitFor(() => expect(result.current.leastSold).toHaveLength(1))
    await waitFor(() => expect(result.current.highestRevenue).toHaveLength(1))

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      pending.resolve({ data: { outOfStockProducts: [] } })
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('reports error when any of the queries fails', async () => {
    const testClient = createTestClient((operation) => {
      switch (operation.operationName) {
        case 'BestSellingProducts':
          return { data: { bestSellingProducts: [] } }
        case 'LeastSoldProducts':
          return { data: { leastSoldProducts: [] } }
        case 'HighestRevenueProducts':
          return { data: { highestRevenueProducts: [] } }
        case 'OutOfStockProducts':
          return new Error('boom')
        default:
          return { data: {} }
      }
    })

    const { result } = renderHookWithProviders(() => useProductReports(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.bestSellers).toEqual([])
  })
})
