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
