import { createContext, useContext } from 'react'
import type { AppName, UserRole } from '@repo/domain'

export type RegisterRole = 'customer' | 'rider'

export interface AuthAppConfig {
  app?: AppName
  defaultPath?: string
  branchUrl?: string
  adminUrl?: string
  riderUrl?: string
  redirectByRole?: (role?: UserRole) => void
  registerDefaultRole?: RegisterRole
  registerRoles?: RegisterRole[]
  showRegister?: boolean
}

export const AuthConfigContext = createContext<AuthAppConfig>({ defaultPath: '/' })

export const useAuthConfig = () => useContext(AuthConfigContext)
