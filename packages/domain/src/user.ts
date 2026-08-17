export type UserRole = "client" | "admin"

export interface User {
  id: number
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
