import { describe, expect, it } from 'vitest'
import { adjustStockSchema } from '../schemas'

describe('adjustStockSchema (stock FE)', () => {
  const valid = ['5', '-3', '0.5', '-0.25', '10.0', ' 7 ', '-100']
  const invalid = ['0', '-0', '0.0', '', '   ', 'abc', '5.', '.5', '+5', '1e3']

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
