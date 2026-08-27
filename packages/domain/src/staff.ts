import type { UserRole } from './user'

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  active: boolean
  branchId?: number
  branchName?: string
}

export interface StaffInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: 'branch_admin' | 'super_admin'
  branchId?: number
}
