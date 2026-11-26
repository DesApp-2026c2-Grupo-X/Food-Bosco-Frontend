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

// Límites de legibilidad: hasta 2 días conviene ver por hora; hasta un mes,
// cada día; hasta medio año, por semana; más allá, un punto por mes.
const HOUR_GRANULARITY_MAX_DAYS = 2
const DAY_GRANULARITY_MAX_DAYS = 31
const WEEK_GRANULARITY_MAX_DAYS = 180

export const countReportRangeDays = (from: Date, to: Date): number => {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.max(1, Math.round((end - start) / MS_PER_DAY) + 1)
}

export const resolveReportGroupBy = (from: Date, to: Date): ReportGroupBy => {
  const days = countReportRangeDays(from, to)

  if (days <= HOUR_GRANULARITY_MAX_DAYS) return 'HOUR'
  if (days <= DAY_GRANULARITY_MAX_DAYS) return 'DAY'
  if (days <= WEEK_GRANULARITY_MAX_DAYS) return 'WEEK'
  return 'MONTH'
}

const toReportRange = (from: Date, to: Date, groupBy?: ReportGroupBy): ReportRange => ({
  from,
  to,
  groupBy: groupBy ?? resolveReportGroupBy(from, to),
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
    return toReportRange(startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to, 'DAY')
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
    return toReportRange(startOfDay(now), endOfDay(now), 'HOUR')
  }

  if (preset === 'week') {
    return toReportRange(startOfWeek(now), endOfDay(now), 'DAY')
  }

  if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return toReportRange(startOfDay(firstDay), endOfDay(now), 'DAY')
  }

  const rawFrom = customFrom ? startOfDay(parseDateInput(customFrom)) : startOfDay(now)
  const rawTo = customTo ? endOfDay(parseDateInput(customTo)) : endOfDay(now)

  if (rawFrom.getTime() <= rawTo.getTime()) {
    return toReportRange(rawFrom, rawTo)
  }

  return toReportRange(startOfDay(rawTo), rawTo)
}

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const
const WEEKDAYS_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const
const MONTHS_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const
const MONTHS_LONG = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export interface FormatReportBucketOptions {
  groupBy?: ReportGroupBy
  preset?: ReportPeriodPreset
  spanDays?: number
}

export interface FormattedReportBucket {
  axisLabel: string
  tooltipLabel: string
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

export const formatReportBucket = (
  bucket: string,
  options: FormatReportBucketOptions = {},
): FormattedReportBucket => {
  const { groupBy, preset, spanDays } = options

  const hourMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/.exec(bucket)
  if (hourMatch || groupBy === 'HOUR') {
    if (!hourMatch) return { axisLabel: bucket, tooltipLabel: bucket }
    const [, , monthStr = '', dayStr = '', hourStr = ''] = hourMatch
    const monthName = MONTHS_SHORT[Number(monthStr) - 1] ?? monthStr
    const dayNum = Number(dayStr)
    const multiDay = (spanDays ?? 1) > 1 && preset !== 'day'
    return {
      axisLabel: multiDay ? `${dayStr}/${monthStr} ${hourStr}h` : `${hourStr}:00`,
      tooltipLabel: `${dayNum} ${monthName} · ${hourStr}:00 - ${hourStr}:59`,
    }
  }

  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bucket)
  if (dayMatch) {
    const [, yearStr = '', monthStr = '', dayStr = ''] = dayMatch
    const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr))
    const weekdayShort = WEEKDAYS_SHORT[date.getDay()] ?? ''
    const weekdayLong = WEEKDAYS_LONG[date.getDay()] ?? ''
    const monthName = MONTHS_SHORT[Number(monthStr) - 1] ?? monthStr
    const dayNum = Number(dayStr)

    const useWeekday = preset === 'week' || (preset === 'custom' && (spanDays ?? 0) <= 7)
    return {
      axisLabel: useWeekday ? `${weekdayShort} ${dayNum}` : `${dayStr}/${monthStr}`,
      tooltipLabel: useWeekday
        ? `${weekdayLong} ${dayNum} ${monthName}`
        : `${dayNum} ${monthName} ${yearStr}`,
    }
  }

  const weekMatch = /^(\d{4})-W(\d{2})$/.exec(bucket)
  if (weekMatch) {
    const [, yearStr = '', weekStr = ''] = weekMatch
    return {
      axisLabel: `Sem ${Number(weekStr)}`,
      tooltipLabel: `Semana ${Number(weekStr)} (${yearStr})`,
    }
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(bucket)
  if (monthMatch) {
    const [, yearStr = '', monthStr = ''] = monthMatch
    const shortName = capitalize(MONTHS_SHORT[Number(monthStr) - 1] ?? monthStr)
    const longName = MONTHS_LONG[Number(monthStr) - 1] ?? monthStr
    return {
      axisLabel: `${shortName} ${yearStr}`,
      tooltipLabel: `${longName} ${yearStr}`,
    }
  }

  return { axisLabel: bucket, tooltipLabel: bucket }
}

export const describeReportGranularity = (
  groupBy?: ReportGroupBy,
  preset?: ReportPeriodPreset,
  spanDays?: number,
): string => {
  if (groupBy === 'HOUR') return 'por hora'
  if (groupBy === 'DAY') {
    if (preset === 'week' || (preset === 'custom' && (spanDays ?? 0) <= 7)) {
      return 'por día de la semana'
    }
    return 'por día'
  }
  if (groupBy === 'WEEK') return 'por semana'
  if (groupBy === 'MONTH') return 'por mes'
  return 'por período'
}
