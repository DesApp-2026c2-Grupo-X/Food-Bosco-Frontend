import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useReportsOverview } from '../useReportsOverview'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOverview = {
  period: { from: '2025-01-01', to: '2025-01-31' },
  kpis: {
    totalRevenue: 1000,
    totalOrders: 10,
    averageTicket: 100,
    cancelledOrders: 1,
    bestSellingProduct: { productId: 'p1', name: 'Burger', quantity: 2, revenue: 200 },
    topBranch: { branchId: 'b1', branchName: 'Centro', revenue: 500, orders: 5 },
  },
  variation: { revenuePct: 10, ordersPct: null, averageTicketPct: null },
  salesSeries: [{ bucket: '2025-01-01', revenue: 100, orders: 1 }],
  ordersByStatus: [{ status: 'PENDING', count: 3 }],
  topProducts: [{ productId: 'p1', name: 'Burger', quantity: 2, revenue: 200 }],
  branchPerformance: [{ branchId: 'b1', branchName: 'Centro', revenue: 500, orders: 5 }],
}

describe('useReportsOverview', () => {
  it('maps the overview and forwards the filter', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'ReportsOverview') {
        return { data: { reportsOverview: rawOverview } }
      }
      return { data: {} }
    })

    const { result } = renderHookWithProviders(
      () => useReportsOverview({ from: '2025-01-01', to: '2025-01-31' }),
      { client: testClient.client },
    )

    await waitFor(() => expect(result.current.overview).not.toBeNull())

    expect(result.current.overview?.kpis.totalRevenue).toBe(1000)
    expect(result.current.overview?.kpis.bestSellingProduct?.name).toBe('Burger')
    expect(result.current.overview?.topProducts[0]).toEqual({
      productId: 'p1',
      name: 'Burger',
      quantity: 2,
      revenue: 200,
    })
    expect(result.current.overview?.ordersByStatus[0].status).toBe('PENDING')
    expect(operationVariables(testClient.lastRequest('ReportsOverview'))).toEqual({
      filter: { from: '2025-01-01', to: '2025-01-31' },
    })
  })

  it('exposes a null overview when the api returns null', async () => {
    const testClient = createTestClient(() => ({ data: { reportsOverview: null } }))
    const { result } = renderHookWithProviders(() => useReportsOverview(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.overview).toBeNull()
  })

  it('does not query when skipped', async () => {
    const testClient = createTestClient(() => ({ data: { reportsOverview: rawOverview } }))
    const { result } = renderHookWithProviders(() => useReportsOverview({}, { skip: true }), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('ReportsOverview')).toHaveLength(0)
    expect(result.current.overview).toBeNull()
  })

  it('reports error as a boolean', async () => {
    const testClient = createTestClient(() => new Error('boom'))
    const { result } = renderHookWithProviders(() => useReportsOverview(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.error).toBe(true))
  })

  it('passes refetch through to the query', async () => {
    const testClient = createTestClient(() => ({ data: { reportsOverview: rawOverview } }))
    const { result } = renderHookWithProviders(() => useReportsOverview(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.overview).not.toBeNull())
    const before = testClient.requestsByName('ReportsOverview').length

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() =>
      expect(testClient.requestsByName('ReportsOverview').length).toBeGreaterThan(before),
    )
  })
})
