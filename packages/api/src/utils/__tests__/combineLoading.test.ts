import { describe, expect, it } from 'vitest'
import { combineLoading } from '../combineLoading'

describe('combineLoading', () => {
  it('is false with no values', () => {
    expect(combineLoading()).toBe(false)
  })

  it('is true when any value is true', () => {
    expect(combineLoading(false, true, false)).toBe(true)
  })

  it('is false when every value is false', () => {
    expect(combineLoading(false, false)).toBe(false)
  })
})
