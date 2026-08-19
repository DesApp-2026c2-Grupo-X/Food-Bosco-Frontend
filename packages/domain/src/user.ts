export type UserRole = 'customer' | 'branch_admin' | 'super_admin' | 'rider'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone: string
  active: boolean
  createdAt: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phone?: string
}
