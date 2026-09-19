import { describe, expect, it } from 'vitest'
import {
  toBranchStock,
  toConfigGroupType,
  toOutOfStockRow,
  toParameter,
  toProductReportRow,
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
