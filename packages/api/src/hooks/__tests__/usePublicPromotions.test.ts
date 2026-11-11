import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePublicPromotions } from '../usePublicPromotions'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const mockPromo = {
  id: 'promo-1',
  name: '2x1 en Hamburguesas',
  description: 'Comprá 2 y pagá 1',
  type: 'BUY_X_GET_Y',
  discountValue: null,
  maxDiscount: null,
  buyQuantity: 2,
  payQuantity: 1,
  scope: 'CATEGORY',
  code: null,
  active: true,
  categoryIds: [],
  productIds: [],
  branchIds: [],
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  minSubtotal: 0,
  minQuantity: 0,
  stackable: false,
  priority: 0,
  maxUsesTotal: null,
  maxUsesPerCustomer: null,
  usedCount: 0,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'PublicPromotions') {
      return { data: { publicPromotions: [mockPromo] } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => usePublicPromotions(), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('usePublicPromotions', () => {
  it('loads and maps public promotions', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.promotions).toHaveLength(1)
    expect(result.current.promotions[0].name).toBe('2x1 en Hamburguesas')
    expect(result.current.promotions[0].type).toBe('BUY_X_GET_Y')
  })
})
