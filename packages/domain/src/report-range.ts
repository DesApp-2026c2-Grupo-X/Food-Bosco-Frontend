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

const GROUP_BY_BY_PRESET: Record<Exclude<ReportPeriodPreset, 'custom'>, ReportGroupBy> = {
  day: 'DAY',
  week: 'WEEK',
  month: 'MONTH',
}

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

export const buildReportRange = (
  preset: ReportPeriodPreset,
  customFrom?: string,
  customTo?: string,
  now: Date = new Date(),
): ReportRange => {
  if (preset === 'day') {
    return { from: startOfDay(now), to: endOfDay(now), groupBy: GROUP_BY_BY_PRESET.day }
  }

  if (preset === 'week') {
    return { from: startOfWeek(now), to: endOfDay(now), groupBy: GROUP_BY_BY_PRESET.week }
  }

  if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: startOfDay(firstDay), to: endOfDay(now), groupBy: GROUP_BY_BY_PRESET.month }
  }

  const rawFrom = customFrom ? startOfDay(parseDateInput(customFrom)) : startOfDay(now)
  const rawTo = customTo ? endOfDay(parseDateInput(customTo)) : endOfDay(now)

  if (rawFrom.getTime() <= rawTo.getTime()) {
    return { from: rawFrom, to: rawTo, groupBy: 'DAY' }
  }

  return { from: startOfDay(rawTo), to: rawTo, groupBy: 'DAY' }
}
