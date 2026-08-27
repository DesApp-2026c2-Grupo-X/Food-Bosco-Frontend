export interface BranchHours {
  dayOfWeek: number
  opening: string
  closing: string
  closed: boolean
}

export interface AdminBranch {
  id: number
  name: string
  addressText: string
  latitude: number
  longitude: number
  phone: string
  active: boolean
  hours: BranchHours[]
}

export interface BranchInput {
  name: string
  addressText: string
  latitude: number
  longitude: number
  phone: string
  active: boolean
}

export interface BranchHoursInput {
  dayOfWeek: number
  opening: string
  closing: string
  closed: boolean
}
