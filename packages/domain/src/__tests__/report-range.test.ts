import { describe, expect, it } from 'vitest'
import { formatPercent } from '../format'
import {
  buildCustomerReportRange,
  buildReportRange,
  countReportRangeDays,
  describeReportGranularity,
  endOfDay,
  formatReportBucket,
  resolveReportGroupBy,
  startOfDay,
  startOfWeek,
} from '../report-range'

const NOW = new Date(2024, 0, 10, 15, 30, 0)

describe('buildReportRange', () => {
  it('day preset covers today and groups by hour', () => {
    const range = buildReportRange('day', undefined, undefined, NOW)

    expect(range.groupBy).toBe('HOUR')
    expect(range.from).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('week preset starts on Monday and groups by day', () => {
    const range = buildReportRange('week', undefined, undefined, NOW)

    expect(range.groupBy).toBe('DAY')
    expect(range.from).toEqual(new Date(2024, 0, 8, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('month preset starts on the first day of the month and groups by day', () => {
    const range = buildReportRange('month', undefined, undefined, NOW)

    expect(range.groupBy).toBe('DAY')
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

  it('custom preset without dates defaults to today and groups by hour', () => {
    const range = buildReportRange('custom', undefined, undefined, NOW)

    expect(range.groupBy).toBe('HOUR')
    expect(range.from).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('custom preset fills a missing bound with today', () => {
    const range = buildReportRange('custom', '2024-01-05', undefined, NOW)

    expect(range.from).toEqual(new Date(2024, 0, 5, 0, 0, 0, 0))
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })

  it('custom preset groups by weeks for a 60-day range', () => {
    const range = buildReportRange('custom', '2024-01-01', '2024-02-29', NOW)

    expect(range.groupBy).toBe('WEEK')
  })

  it('custom preset groups by months for a range longer than six months', () => {
    const range = buildReportRange('custom', '2024-01-01', '2024-06-29', NOW)

    expect(range.groupBy).toBe('MONTH')
  })
})

describe('resolveReportGroupBy', () => {
  it.each([
    { days: 1, label: 'un día', expected: 'HOUR' },
    { days: 2, label: 'dos días', expected: 'HOUR' },
    { days: 3, label: 'tres días', expected: 'DAY' },
    { days: 31, label: 'un mes', expected: 'DAY' },
    { days: 32, label: 'un mes y un día', expected: 'WEEK' },
    { days: 180, label: 'medio año', expected: 'WEEK' },
    { days: 181, label: 'más de medio año', expected: 'MONTH' },
  ])('agrupa por $expected un rango de $label', ({ days, expected }) => {
    const from = new Date(2024, 0, 1)
    const to = new Date(2024, 0, days, 23, 59, 59, 999)

    expect(countReportRangeDays(from, to)).toBe(days)
    expect(resolveReportGroupBy(from, to)).toBe(expected)
  })
})

describe('formatReportBucket', () => {
  it('formatea buckets horarios para un solo día y para dos días', () => {
    expect(
      formatReportBucket('2026-11-25T14', { groupBy: 'HOUR', preset: 'day', spanDays: 1 }),
    ).toEqual({
      axisLabel: '14:00',
      tooltipLabel: '25 nov · 14:00 - 14:59',
    })

    expect(
      formatReportBucket('2026-11-25T14', { groupBy: 'HOUR', preset: 'custom', spanDays: 2 }),
    ).toEqual({
      axisLabel: '25/11 14h',
      tooltipLabel: '25 nov · 14:00 - 14:59',
    })
  })

  it('formatea buckets diarios con nombre de día en semana y fecha corta en mes', () => {
    expect(
      formatReportBucket('2026-11-25', { groupBy: 'DAY', preset: 'week', spanDays: 3 }),
    ).toEqual({
      axisLabel: 'Mié 25',
      tooltipLabel: 'Miércoles 25 nov',
    })

    expect(
      formatReportBucket('2026-11-25', { groupBy: 'DAY', preset: 'month', spanDays: 25 }),
    ).toEqual({
      axisLabel: '25/11',
      tooltipLabel: '25 nov 2026',
    })
  })

  it('formatea buckets semanales y mensuales', () => {
    expect(formatReportBucket('2026-W48', { groupBy: 'WEEK' })).toEqual({
      axisLabel: 'Sem 48',
      tooltipLabel: 'Semana 48 (2026)',
    })

    expect(formatReportBucket('2026-11', { groupBy: 'MONTH' })).toEqual({
      axisLabel: 'Nov 2026',
      tooltipLabel: 'Noviembre 2026',
    })
  })

  it('describe la granularidad según período y groupBy', () => {
    expect(describeReportGranularity('HOUR', 'day', 1)).toBe('por hora')
    expect(describeReportGranularity('DAY', 'week', 3)).toBe('por día de la semana')
    expect(describeReportGranularity('DAY', 'month', 25)).toBe('por día')
    expect(describeReportGranularity('WEEK', 'custom', 60)).toBe('por semana')
    expect(describeReportGranularity('MONTH', 'custom', 240)).toBe('por mes')
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

describe('buildCustomerReportRange', () => {
  const cases = [
    {
      name: 'este mes',
      preset: 'month' as const,
      groupBy: 'DAY',
      from: new Date(2024, 0, 1, 0, 0, 0, 0),
    },
    {
      name: '�ltimos 3 meses',
      preset: 'quarter' as const,
      groupBy: 'WEEK',
      from: new Date(2023, 10, 1, 0, 0, 0, 0),
    },
    {
      name: '�ltimo a�o',
      preset: 'year' as const,
      groupBy: 'MONTH',
      from: new Date(2023, 1, 1, 0, 0, 0, 0),
    },
  ]

  it.each(cases)('$name comienza en $from y agrupa por $groupBy', ({ preset, groupBy, from }) => {
    const range = buildCustomerReportRange(preset, NOW)

    expect(range.groupBy).toBe(groupBy)
    expect(range.from).toEqual(from)
    expect(range.to).toEqual(new Date(2024, 0, 10, 23, 59, 59, 999))
  })
})
