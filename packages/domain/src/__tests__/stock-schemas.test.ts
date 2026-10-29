import { describe, expect, it } from 'vitest'
import { adjustStockSchema } from '../schemas'
import {
  filterLowStockAlerts,
  getStockAlertLevel,
  matchesStockStatus,
  type BranchStock,
} from '../stock'

describe('adjustStockSchema (stock FE)', () => {
  const valid = ['5', '-3', '0.5', '-0.25', '10.0', ' 7 ', '-100', '+5', '+0.25', ' +7 ']
  const invalid = ['0', '-0', '+0', '0.0', '', '   ', 'abc', '5.', '.5', '++5', '1e3']

  it.each(valid)('F-9: acepta el delta %s', (delta) => {
    expect(adjustStockSchema.safeParse({ delta }).success).toBe(true)
  })

  it.each(invalid)('F-10: rechaza el delta %s', (delta) => {
    expect(adjustStockSchema.safeParse({ delta }).success).toBe(false)
  })

  it('F-10b: 0 se rechaza con el mensaje de negocio', () => {
    const result = adjustStockSchema.safeParse({ delta: '0' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('La cantidad no puede ser 0')
  })

  it('F-11: reason es opcional y se recorta', () => {
    expect(adjustStockSchema.safeParse({ delta: '5' }).success).toBe(true)

    const parsed = adjustStockSchema.parse({ delta: '5', reason: '  conteo físico  ' })
    expect(parsed.reason).toBe('conteo físico')
  })
})

describe('getStockAlertLevel / filterLowStockAlerts / matchesStockStatus', () => {
  const makeRow = (overrides: Partial<BranchStock> = {}): BranchStock => ({
    branchId: 'b1',
    ingredientId: 'i1',
    quantity: 10,
    ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 20, active: true },
    ...overrides,
  })

  it('returns ok when ingredient is inactive or minQuantity <= 0', () => {
    expect(getStockAlertLevel(makeRow({ ingredient: null }))).toBe('ok')
    expect(
      getStockAlertLevel(
        makeRow({
          quantity: 0,
          ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 20, active: false },
        }),
      ),
    ).toBe('ok')
    expect(
      getStockAlertLevel(
        makeRow({
          quantity: 0,
          ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 0, active: true },
        }),
      ),
    ).toBe('ok')
  })

  it('classifies out_of_stock, low_stock, and ok when minQuantity > 0', () => {
    expect(getStockAlertLevel(makeRow({ quantity: 0 }))).toBe('out_of_stock')
    expect(getStockAlertLevel(makeRow({ quantity: 20 }))).toBe('low_stock')
    expect(getStockAlertLevel(makeRow({ quantity: 5 }))).toBe('low_stock')
    expect(getStockAlertLevel(makeRow({ quantity: 21 }))).toBe('ok')
  })

  it('filters and sorts low stock alerts prioritizing out_of_stock then lowest ratio', () => {
    const rows: BranchStock[] = [
      makeRow({
        ingredientId: 'i1',
        quantity: 15,
        ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 20, active: true },
      }),
      makeRow({
        ingredientId: 'i2',
        quantity: 0,
        ingredient: { id: 'i2', name: 'Tomate', unit: 'un', minQuantity: 10, active: true },
      }),
      makeRow({
        ingredientId: 'i3',
        quantity: 2,
        ingredient: { id: 'i3', name: 'Cheddar', unit: 'un', minQuantity: 20, active: true },
      }),
      makeRow({
        ingredientId: 'i4',
        quantity: 50,
        ingredient: { id: 'i4', name: 'Agua', unit: 'botella', minQuantity: 10, active: true },
      }),
    ]

    const alerts = filterLowStockAlerts(rows)
    expect(alerts.map((r) => r.ingredientId)).toEqual(['i2', 'i3', 'i1'])
  })

  it('matchesStockStatus filters by alert, low_stock, out_of_stock, and ok', () => {
    const outRow = makeRow({ quantity: 0 })
    const lowRow = makeRow({ quantity: 10 })
    const okRow = makeRow({ quantity: 30 })

    expect(matchesStockStatus(outRow, '')).toBe(true)
    expect(matchesStockStatus(outRow, 'alert')).toBe(true)
    expect(matchesStockStatus(lowRow, 'alert')).toBe(true)
    expect(matchesStockStatus(okRow, 'alert')).toBe(false)
    expect(matchesStockStatus(outRow, 'out_of_stock')).toBe(true)
    expect(matchesStockStatus(lowRow, 'low_stock')).toBe(true)
    expect(matchesStockStatus(okRow, 'ok')).toBe(true)
  })
})
