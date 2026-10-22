import { useMemo, type ReactNode } from 'react'
import { AuthConfigContext, type AuthAppConfig } from './authConfigContext'

export interface AuthProviderProps extends AuthAppConfig {
  children: ReactNode
}

export const AuthProvider = ({
  app,
  defaultPath = '/',
  branchUrl,
  adminUrl,
  riderUrl,
  redirectByRole,
  registerDefaultRole = 'customer',
  registerRoles = ['customer', 'rider'],
  showRegister = true,
  children,
}: AuthProviderProps) => {
  const value = useMemo(
    () => ({
      app,
      defaultPath,
      branchUrl,
      adminUrl,
      riderUrl,
      redirectByRole,
      registerDefaultRole,
      registerRoles,
      showRegister,
    }),
    [
      app,
      defaultPath,
      branchUrl,
      adminUrl,
      riderUrl,
      redirectByRole,
      registerDefaultRole,
      registerRoles,
      showRegister,
    ],
  )
  return <AuthConfigContext.Provider value={value}>{children}</AuthConfigContext.Provider>
}
