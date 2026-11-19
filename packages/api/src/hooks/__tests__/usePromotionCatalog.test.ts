import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePromotionCatalog } from '../usePromotionCatalog'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawCatalogItem = {
  id: 'pr1',
  name: '20% en hamburguesas',
  description: null,
  type: 'PERCENTAGE',
  scope: 'PRODUCT',
  kind: 'PERCENTAGE',
  badge: '-20%',
  discountValue: 20,
  maxDiscount: null,
  startDate: '2026-11-01T00:00:00.000Z',
  endDate: '2026-11-30T00:00:00.000Z',
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  minSubtotal: 0,
  minQuantity: 0,
  branchIds: [],
  code: null,
  categoryIds: ['c1'],
  productIds: ['p1'],
  categories: [{ id: 'c1', name: 'Hamburguesas', active: true }],
  products: [],
}

describe('usePromotionCatalog', () => {
  it('does not query without coordinates', async () => {
    const testClient = createTestClient(() => ({ data: { promotionCatalog: [] } }))
    const { result } = renderHookWithProviders(() => usePromotionCatalog(null, null), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(testClient.requestsByName('PromotionCatalog')).toHaveLength(0)
    expect(result.current.promotions).toEqual([])
  })

  it('maps the catalog and passes coordinates', async () => {
    const testClient = createTestClient(() => ({
      data: { promotionCatalog: [rawCatalogItem] },
    }))
    const { result } = renderHookWithProviders(() => usePromotionCatalog(-34.6, -58.4), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.promotions).toHaveLength(1))

    expect(result.current.promotions[0].badge).toBe('-20%')
    expect(result.current.promotions[0].products).toEqual([])
    expect(operationVariables(testClient.lastRequest('PromotionCatalog'))).toEqual({
      lat: -34.6,
      lng: -58.4,
    })
  })
})
