import type { ReportGroupBy } from './reporting'

export type ReportPeriodPreset = 'day' | 'week' | 'month' | 'custom'

export interface ReportPeriodOption {
  value: ReportPeriodPreset
  label: string
}

export interface ReportRange {
  from: Date
  to: Date
  groupBy: ReportGroupBy
}

export const REPORT_PERIOD_OPTIONS: ReportPeriodOption[] = [
  { value: 'day', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'custom', label: 'Personalizado' },
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Límites de legibilidad: hasta un mes conviene ver cada día; hasta medio año,
// una barra/punto por semana; más allá, un punto por mes.
const DAY_GRANULARITY_MAX_DAYS = 31
const WEEK_GRANULARITY_MAX_DAYS = 180

export const countReportRangeDays = (from: Date, to: Date): number => {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.max(1, Math.round((end - start) / MS_PER_DAY) + 1)
}

export const resolveReportGroupBy = (from: Date, to: Date): ReportGroupBy => {
  const days = countReportRangeDays(from, to)

  if (days <= DAY_GRANULARITY_MAX_DAYS) return 'DAY'
  if (days <= WEEK_GRANULARITY_MAX_DAYS) return 'WEEK'
  return 'MONTH'
}

const toReportRange = (from: Date, to: Date): ReportRange => ({
  from,
  to,
  groupBy: resolveReportGroupBy(from, to),
})

export const startOfDay = (value: Date): Date => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export const endOfDay = (value: Date): Date => {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date
}

export const startOfWeek = (value: Date): Date => {
  const date = startOfDay(value)
  const day = date.getDay()
  const diff = day === 0 ? 6 : day - 1
  date.setDate(date.getDate() - diff)
  return date
}

const parseDateInput = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  return new Date(value)
}

export type CustomerReportPreset = 'month' | 'quarter' | 'year'

export interface CustomerReportPeriodOption {
  value: CustomerReportPreset
  label: string
}

export const CUSTOMER_REPORT_PERIOD_OPTIONS: CustomerReportPeriodOption[] = [
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Últimos 3 meses' },
  { value: 'year', label: 'Último año' },
]

export const buildCustomerReportRange = (
  preset: CustomerReportPreset,
  now: Date = new Date(),
): ReportRange => {
  const to = endOfDay(now)

  if (preset === 'month') {
    return toReportRange(startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to)
  }

  if (preset === 'quarter') {
    return toReportRange(startOfDay(new Date(now.getFullYear(), now.getMonth() - 2, 1)), to)
  }

  return toReportRange(startOfDay(new Date(now.getFullYear(), now.getMonth() - 11, 1)), to)
}

export const buildReportRange = (
  preset: ReportPeriodPreset,
  customFrom?: string,
  customTo?: string,
  now: Date = new Date(),
): ReportRange => {
  if (preset === 'day') {
    return toReportRange(startOfDay(now), endOfDay(now))
  }

  if (preset === 'week') {
    return toReportRange(startOfWeek(now), endOfDay(now))
  }

  if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return toReportRange(startOfDay(firstDay), endOfDay(now))
  }

  const rawFrom = customFrom ? startOfDay(parseDateInput(customFrom)) : startOfDay(now)
  const rawTo = customTo ? endOfDay(parseDateInput(customTo)) : endOfDay(now)

  if (rawFrom.getTime() <= rawTo.getTime()) {
    return toReportRange(rawFrom, rawTo)
  }

  return toReportRange(startOfDay(rawTo), rawTo)
}
