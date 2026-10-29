import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCustomerReports } from '../useCustomerReports'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOverview = {
  period: { from: '2026-03-01T00:00:00.000Z', to: '2026-03-31T23:59:59.999Z' },
  summary: {
    totalOrders: 4,
    completedOrders: 2,
    cancelledOrders: 1,
    activeOrders: 1,
    totalSpent: 500,
    averageTicket: 250,
    favoriteBranch: { branchId: 'b1', branchName: 'Centro', orders: 2, totalSpent: 500 },
  },
  activitySeries: [{ bucket: '2026-03', orders: 4, completedOrders: 2, totalSpent: 500 }],
  frequentProducts: [
    { productId: 'p1', name: 'Hamburguesa', quantity: 6, orders: 3, totalSpent: 900 },
  ],
  ordersByStatus: [{ status: 'DELIVERED', count: 2 }],
}

describe('useCustomerReports', () => {
  it('mapea el reporte y envía el filtro', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'MyReportsOverview') {
        return { data: { myReportsOverview: rawOverview } }
      }
      return { data: {} }
    })

    const { result } = renderHookWithProviders(
      () => useCustomerReports({ from: '2026-03-01', to: '2026-03-31', groupBy: 'MONTH' }),
      { client: testClient.client },
    )

    await waitFor(() => expect(result.current.overview).not.toBeNull())

    expect(result.current.overview?.summary.totalSpent).toBe(500)
    expect(result.current.overview?.summary.favoriteBranch?.branchName).toBe('Centro')
    expect(result.current.overview?.frequentProducts[0]).toEqual({
      productId: 'p1',
      name: 'Hamburguesa',
      quantity: 6,
      orders: 3,
      totalSpent: 900,
    })
    expect(result.current.overview?.ordersByStatus[0].status).toBe('DELIVERED')
    expect(operationVariables(testClient.lastRequest('MyReportsOverview'))).toEqual({
      filter: { from: '2026-03-01', to: '2026-03-31', groupBy: 'MONTH' },
    })
  })

  it('expone overview nulo cuando la API devuelve null', async () => {
    const testClient = createTestClient(() => ({ data: { myReportsOverview: null } }))
    const { result } = renderHookWithProviders(() => useCustomerReports(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.overview).toBeNull()
  })

  it('no consulta cuando se omite', async () => {
    const testClient = createTestClient(() => ({ data: { myReportsOverview: rawOverview } }))
    const { result } = renderHookWithProviders(() => useCustomerReports({}, { skip: true }), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('MyReportsOverview')).toHaveLength(0)
    expect(result.current.overview).toBeNull()
  })

  it('expone el error como booleano', async () => {
    const testClient = createTestClient(() => new Error('boom'))
    const { result } = renderHookWithProviders(() => useCustomerReports(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.error).toBe(true))
  })
})
