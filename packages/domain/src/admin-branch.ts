export interface BranchHours {
  dayOfWeek: number
  opening: string | null
  closing: string | null
  closed: boolean
}

export interface AdminBranch {
  id: string
  name: string
  addressText: string
  latitude: number
  longitude: number
  phone: string | null
  active: boolean
  hours: BranchHours[]
}

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
