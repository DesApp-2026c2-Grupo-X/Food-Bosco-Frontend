import type { Branch } from './branch'

export interface BranchHours {
  dayOfWeek: number
  opening: string | null
  closing: string | null
  closed: boolean
}

export type AdminBranch = Branch

export interface BranchInput {
  name: string
  addressText: string
  latitude: number
  longitude: number
  phone?: string | null
  active: boolean
}

export interface BranchHoursInput {
  dayOfWeek: number
  opening?: string | null
  closing?: string | null
  closed: boolean
}

export const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export const DEFAULT_HOURS: BranchHoursInput[] = WEEK_DAYS.map(({ value }) => ({
  dayOfWeek: value,
  opening: '09:00',
  closing: '23:00',
  closed: false,
}))
