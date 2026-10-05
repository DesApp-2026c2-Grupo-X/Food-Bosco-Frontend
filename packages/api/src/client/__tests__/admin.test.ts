import { describe, expect, it } from 'vitest'
import {
  toBranchPerformanceRow,
  toBranchStock,
  toConfigGroupType,
  toOutOfStockRow,
  toParameter,
  toProductReportRow,
  toProductSalesRow,
  toReportsOverview,
  toStaffMember,
} from '../admin'

describe('toParameter', () => {
  it('maps key/value/unit', () => {
    expect(toParameter({ key: 'delivery_fee', value: '250', unit: 'ARS' })).toEqual({
      key: 'delivery_fee',
      value: 250,
      unit: 'ARS',
    })
  })
})

describe('toStaffMember', () => {
  it('maps roles and keeps branchId null when absent', () => {
    const member = toStaffMember({
      id: 'u1',
      firstName: 'Ana',
      lastName: 'Perez',
      email: 'a@b.com',
      phone: '123',
      role: 'BRANCH_ADMIN',
      active: true,
    })
    expect(member).toMatchObject({ id: 'u1', role: 'branch_admin', active: true, branchId: null })
  })
})

describe('toBranchStock', () => {
  it('maps ingredient and quantity', () => {
    const stock = toBranchStock({
      ingredientId: 'i1',
      branchId: 'b1',
      quantity: '10',
      ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
    })
    expect(stock).toMatchObject({ ingredientId: 'i1', branchId: 'b1', quantity: 10 })
    expect(stock.ingredient?.name).toBe('Pan')
  })

  it('leaves ingredient null when absent', () => {
    expect(toBranchStock({}).ingredient).toBeNull()
  })
})

describe('report row transforms', () => {
  it('toProductReportRow maps optional quantity and revenue', () => {
    const row = toProductReportRow({
      position: '1',
      product: { id: 'p1', name: 'Burger' },
      category: { id: 'c1', name: 'Comida', active: true },
      quantity: '12',
      revenue: '15000',
    })
    expect(row).toMatchObject({ position: 1, quantity: 12, revenue: 15000 })
    expect(row.category).toEqual({ id: 'c1', name: 'Comida', active: true })
  })

  it('toProductReportRow omits missing metrics', () => {
    const row = toProductReportRow({ position: 2, product: {} })
    expect(row.quantity).toBeUndefined()
    expect(row.revenue).toBeUndefined()
    expect(row.category).toBeUndefined()
  })

  it('toOutOfStockRow maps quantity and category', () => {
    const row = toOutOfStockRow({
      product: { id: 'p1', name: 'Burger' },
      category: { id: 'c1', name: 'Comida', active: true },
      quantity: 0,
    })
    expect(row.quantity).toBe(0)
    expect(row.category?.name).toBe('Comida')
  })
})

describe('toConfigGroupType', () => {
  it('maps domain types to API enum values', () => {
    expect(toConfigGroupType('multiple')).toBe('MULTIPLE')
    expect(toConfigGroupType('single')).toBe('SINGLE')
  })
})

describe('advanced report transforms', () => {
  it('toProductSalesRow maps numeric fields from strings', () => {
    expect(
      toProductSalesRow({ productId: 'p1', name: 'Burger', quantity: '3', revenue: '450' }),
    ).toEqual({ productId: 'p1', name: 'Burger', quantity: 3, revenue: 450 })
  })

  it('toBranchPerformanceRow maps branch metrics', () => {
    expect(
      toBranchPerformanceRow({ branchId: 'b1', branchName: 'Centro', revenue: '900', orders: '4' }),
    ).toEqual({ branchId: 'b1', branchName: 'Centro', revenue: 900, orders: 4 })
  })

  it('toReportsOverview maps kpis, variation, series, statuses and branches', () => {
    const overview = toReportsOverview({
      period: { from: '2026-01-01', to: '2026-01-31' },
      kpis: {
        totalRevenue: '1500',
        totalOrders: '30',
        averageTicket: '50',
        cancelledOrders: '5',
        bestSellingProduct: { productId: 'p1', name: 'Burger', quantity: '10', revenue: '1000' },
        topBranch: { branchId: 'b1', branchName: 'Centro', revenue: '1500', orders: '30' },
      },
      variation: { revenuePct: '50', ordersPct: null, averageTicketPct: null },
      salesSeries: [{ bucket: '2026-01-01', revenue: '1000', orders: '20' }],
      ordersByStatus: [{ status: 'DELIVERED', count: '25' }],
      topProducts: [{ productId: 'p1', name: 'Burger', quantity: '10', revenue: '1000' }],
      branchPerformance: [{ branchId: 'b1', branchName: 'Centro', revenue: '1500', orders: '30' }],
    })

    expect(overview.kpis.totalRevenue).toBe(1500)
    expect(overview.kpis.bestSellingProduct?.name).toBe('Burger')
    expect(overview.kpis.topBranch?.branchName).toBe('Centro')
    expect(overview.variation).toEqual({ revenuePct: 50, ordersPct: null, averageTicketPct: null })
    expect(overview.salesSeries).toEqual([{ bucket: '2026-01-01', revenue: 1000, orders: 20 }])
    expect(overview.ordersByStatus).toEqual([{ status: 'DELIVERED', count: 25 }])
    expect(overview.branchPerformance).toHaveLength(1)
  })

  it('toReportsOverview defaults an empty payload', () => {
    const overview = toReportsOverview({})

    expect(overview.kpis).toEqual({
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      cancelledOrders: 0,
      bestSellingProduct: null,
      topBranch: null,
    })
    expect(overview.variation).toEqual({
      revenuePct: null,
      ordersPct: null,
      averageTicketPct: null,
    })
    expect(overview.salesSeries).toEqual([])
    expect(overview.topProducts).toEqual([])
    expect(overview.branchPerformance).toEqual([])
  })
})
