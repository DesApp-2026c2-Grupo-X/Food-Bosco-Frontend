import type { BranchHours } from './admin-branch'

export interface Branch {
  id: string
  name: string
  addressText: string
  latitude: number
  longitude: number
  phone: string | null
  active: boolean
  hours: BranchHours[]
}

const timeToMinutes = (value: string | null | undefined): number | null => {
  if (!value) return null
  const [hours, minutes] = value.split(':').map((part) => Number(part))
  if (
    hours === undefined ||
    minutes === undefined ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null
  }
  return hours * 60 + minutes
}

export const isBranchOpenNow = (hours: BranchHours[], now: Date = new Date()): boolean => {
  const dayOfWeek = now.getDay()
  const hour = hours.find((entry) => entry.dayOfWeek === dayOfWeek)

  if (!hour || hour.closed) return false

  const opening = timeToMinutes(hour.opening)
  const closing = timeToMinutes(hour.closing)
  if (opening === null || closing === null) return false

  const current = now.getHours() * 60 + now.getMinutes()
  return current >= opening && current < closing
}
