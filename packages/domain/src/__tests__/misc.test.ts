import { describe, expect, it } from 'vitest'
import {
  ATTENTION_ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_PALETTE,
} from '../order-status'
import {
  ACTIVE_FILTER_OPTIONS,
  ACTIVE_FILTER_OPTIONS_FEMININE,
  matchesActiveStatus,
  optionsFromEntities,
} from '../filters'
import { toProductListLine } from '../product-list'
import { isStaffRole, ROLE_LABELS, ROLE_OPTIONS, STAFF_ROLES } from '../user'

describe('order status maps', () => {
  it('labels every status', () => {
    const statuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_DELIVERY',
      'ON_THE_WAY',
      'DELIVERED',
      'CANCELLED',
    ] as const
    statuses.forEach((status) => {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy()
      expect(ORDER_STATUS_PALETTE[status]).toBeTruthy()
    })
  })

  it('builds options from labels preserving order', () => {
    expect(ORDER_STATUS_OPTIONS[0]).toEqual({ value: 'PENDING', label: 'Pendiente' })
    expect(ORDER_STATUS_OPTIONS.map((option) => option.value)).toEqual(
      Object.keys(ORDER_STATUS_LABELS),
    )
  })

  it('marks only pre-delivery statuses as attention', () => {
    expect(ATTENTION_ORDER_STATUSES).toContain('PENDING')
    expect(ATTENTION_ORDER_STATUSES).not.toContain('DELIVERED')
    expect(ATTENTION_ORDER_STATUSES).not.toContain('CANCELLED')
  })
})

describe('matchesActiveStatus', () => {
  it('passes everything through when the filter is empty or unknown', () => {
    expect(matchesActiveStatus(true, '')).toBe(true)
    expect(matchesActiveStatus(false, '')).toBe(true)
    expect(matchesActiveStatus(false, 'whatever')).toBe(true)
  })

  it('filters active and inactive', () => {
    expect(matchesActiveStatus(true, 'active')).toBe(true)
    expect(matchesActiveStatus(false, 'active')).toBe(false)
    expect(matchesActiveStatus(false, 'inactive')).toBe(true)
    expect(matchesActiveStatus(true, 'inactive')).toBe(false)
  })
})

describe('optionsFromEntities', () => {
  it('maps id/name pairs to string values', () => {
    expect(
      optionsFromEntities([
        { id: 1, name: 'Bebidas' },
        { id: '2', name: 'Postres' },
      ]),
    ).toEqual([
      { value: '1', label: 'Bebidas' },
      { value: '2', label: 'Postres' },
    ])
  })
})

describe('active filter option labels', () => {
  it('has masculine and feminine variants', () => {
    expect(ACTIVE_FILTER_OPTIONS.map((o) => o.label)).toEqual(['Activos', 'Inactivos'])
    expect(ACTIVE_FILTER_OPTIONS_FEMININE.map((o) => o.label)).toEqual(['Activas', 'Inactivas'])
  })
})

describe('toProductListLine', () => {
  const product = { id: 'p1', name: 'Burger', image: null, price: 1000, available: true }

  it('prefers an explicit availability over the product flag', () => {
    expect(toProductListLine({ product, categoryName: 'Comida', available: false }).available).toBe(
      false,
    )
    expect(toProductListLine({ product, categoryName: 'Comida' }).available).toBe(true)
  })

  it('defaults availability to false when unknown', () => {
    expect(
      toProductListLine({
        product: { id: 'p2', name: 'X', price: 1 },
        categoryName: 'C',
      }).available,
    ).toBe(false)
  })
})

describe('roles', () => {
  it('identifies staff roles', () => {
    expect(isStaffRole('branch_admin')).toBe(true)
    expect(isStaffRole('super_admin')).toBe(true)
    expect(isStaffRole('customer')).toBe(false)
    expect(isStaffRole('rider')).toBe(false)
  })

  it('exposes labels and assignable options', () => {
    expect(ROLE_LABELS.rider).toBe('Repartidor')
    expect(ROLE_OPTIONS.map((option) => option.value)).toEqual(['branch_admin', 'super_admin'])
    expect(STAFF_ROLES).toEqual(['branch_admin', 'super_admin'])
  })
})
