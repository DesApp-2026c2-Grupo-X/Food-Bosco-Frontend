import { useMemo, type ReactNode } from 'react'
import { AuthConfigContext, type AuthAppConfig } from './authConfigContext'

export interface AuthProviderProps extends AuthAppConfig {
  children: ReactNode
}

export const AuthProvider = ({
  defaultPath = '/',
  branchUrl,
  adminUrl,
  riderUrl,
  redirectByRole,
  registerDefaultRole = 'customer',
  registerRoles = ['customer', 'rider'],
  children,
}: AuthProviderProps) => {
  const value = useMemo(
    () => ({
      defaultPath,
      branchUrl,
      adminUrl,
      riderUrl,
      redirectByRole,
      registerDefaultRole,
      registerRoles,
    }),
    [
      defaultPath,
      branchUrl,
      adminUrl,
      riderUrl,
      redirectByRole,
      registerDefaultRole,
      registerRoles,
    ],
  )
  return <AuthConfigContext.Provider value={value}>{children}</AuthConfigContext.Provider>
}
