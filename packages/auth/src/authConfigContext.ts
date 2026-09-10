import { createContext, useContext } from 'react'
import type { UserRole } from '@repo/domain'

export type RegisterRole = 'customer' | 'rider'

export interface AuthAppConfig {
  defaultPath?: string
  branchUrl?: string
  adminUrl?: string
  riderUrl?: string
  redirectByRole?: (role?: UserRole) => void
  registerDefaultRole?: RegisterRole
  registerRoles?: RegisterRole[]
}

export const AuthConfigContext = createContext<AuthAppConfig>({ defaultPath: '/' })

export const useAuthConfig = () => useContext(AuthConfigContext)
