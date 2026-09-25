import { describe, expect, it } from 'vitest'
import { isBranchOpenNow } from '../branch'
import type { BranchHours } from '../admin-branch'

const NOW = new Date(2026, 7, 24, 12, 0, 0)
const DAY = NOW.getDay()

const hour = (dayOfWeek: number, overrides: Partial<BranchHours> = {}): BranchHours => ({
  dayOfWeek,
  opening: '09:00',
  closing: '18:00',
  closed: false,
  ...overrides,
})

describe('isBranchOpenNow', () => {
  it('is true within the opening hours', () => {
    expect(isBranchOpenNow([hour(DAY)], NOW)).toBe(true)
  })

  it('is false when the day is marked closed', () => {
    expect(isBranchOpenNow([hour(DAY, { closed: true })], NOW)).toBe(false)
  })

  it('is false without a schedule for the current day', () => {
    expect(isBranchOpenNow([hour((DAY + 1) % 7)], NOW)).toBe(false)
  })

  it('is false before opening', () => {
    expect(isBranchOpenNow([hour(DAY, { opening: '13:00', closing: '20:00' })], NOW)).toBe(false)
  })

  it('is false after closing', () => {
    expect(isBranchOpenNow([hour(DAY, { opening: '08:00', closing: '11:00' })], NOW)).toBe(false)
  })

  it('is false when opening or closing are missing', () => {
    expect(isBranchOpenNow([hour(DAY, { opening: null })], NOW)).toBe(false)
    expect(isBranchOpenNow([hour(DAY, { closing: null })], NOW)).toBe(false)
  })
})
