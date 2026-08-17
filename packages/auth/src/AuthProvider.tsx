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
  children,
}: AuthProviderProps) => {
  const value = useMemo(
    () => ({ defaultPath, branchUrl, adminUrl, riderUrl, redirectByRole }),
    [defaultPath, branchUrl, adminUrl, riderUrl, redirectByRole],
  )
  return <AuthConfigContext.Provider value={value}>{children}</AuthConfigContext.Provider>
}
