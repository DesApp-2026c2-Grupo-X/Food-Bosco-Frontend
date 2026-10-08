import { describe, expect, it } from 'vitest'
import { formatPercent } from '../format'
import { buildReportRange, endOfDay, startOfDay, startOfWeek } from '../report-range'

const NOW = new Date(2024, 0, 10, 15, 30, 0)

describe('buildReportRange', () => {
  it('day preset covers today and groups by day', () => {
    const range = buildReportRange('day', undefined, undefined, NOW)

    expect(range.groupBy).toBe('DAY')
    expect(range.from).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('week preset starts on Monday and groups by week', () => {
    const range = buildReportRange('week', undefined, undefined, NOW)

    expect(range.groupBy).toBe('WEEK')
    expect(range.from).toEqual(new Date(2024, 0, 8, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('month preset starts on the first day of the month', () => {
    const range = buildReportRange('month', undefined, undefined, NOW)

    expect(range.groupBy).toBe('MONTH')
    expect(range.from).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('custom preset uses the provided dates and groups by day', () => {
    const range = buildReportRange('custom', '2024-01-05', '2024-01-07', NOW)

    expect(range.groupBy).toBe('DAY')
    expect(range.from).toEqual(new Date(2024, 0, 5, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 7, 23, 59, 59, 999))
  })

  it('collapses an inverted custom range to the "to" day', () => {
    const range = buildReportRange('custom', '2024-01-10', '2024-01-05', NOW)

    expect(range.from).toEqual(new Date(2024, 0, 5, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 5, 23, 59, 59, 999))
  })

  it('custom preset without dates defaults to today', () => {
    const range = buildReportRange('custom', undefined, undefined, NOW)

    expect(range.groupBy).toBe('DAY')
    expect(range.from).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('custom preset fills a missing bound with today', () => {
    const range = buildReportRange('custom', '2024-01-05', undefined, NOW)

    expect(range.from).toEqual(new Date(2024, 0, 5, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })
})

describe('report range helpers', () => {
  it('startOfDay and endOfDay bound the day', () => {
    expect(startOfDay(NOW)).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0))
    expect(endOfDay(NOW)).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('startOfWeek uses the previous Monday when the date is a Sunday', () => {
    const sunday = new Date(2024, 0, 14, 15, 30, 0)

    expect(sunday.getDay()).toBe(0)
    expect(startOfWeek(sunday)).toEqual(new Date(2024, 0, 8, 0, 0, 0, 0))
  })

  it('startOfWeek returns the same Monday for any mid-week date', () => {
    expect(startOfWeek(NOW)).toEqual(new Date(2024, 0, 8, 0, 0, 0, 0))
  })
})

describe('formatPercent', () => {
  it.each([
    { value: 12.34, expected: '+12,3%' },
    { value: -5, expected: '-5%' },
    { value: 0, expected: '0%' },
  ])('formats $value as $expected', ({ value, expected }) => {
    expect(formatPercent(value)).toBe(expected)
  })
})
