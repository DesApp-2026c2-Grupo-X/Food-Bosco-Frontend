export type UserRole = 'customer' | 'branch_admin' | 'super_admin' | 'rider'

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Cliente',
  branch_admin: 'Administrador de sucursal',
  super_admin: 'Administrador global',
  rider: 'Repartidor',
}

export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'branch_admin', label: 'Colaborador de sucursal' },
  { value: 'super_admin', label: 'Admin global' },
]

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone: string
  active: boolean
  createdAt: string
  branchId?: string
}

export interface UpdateProfileInput {
  firstName: string
  lastName: string
  phone: string
}
