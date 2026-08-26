import { useMemo, type ReactNode } from 'react'
import { AuthConfigContext, type AuthAppConfig } from './authConfigContext'

export interface AuthProviderProps extends AuthAppConfig {
  children: ReactNode
}

export const AuthProvider = ({
  defaultPath = '/',
  adminUrl,
  redirectByRole,
  children,
}: AuthProviderProps) => {
  const value = useMemo(
    () => ({ defaultPath, adminUrl, redirectByRole }),
    [defaultPath, adminUrl, redirectByRole],
  )
  return <AuthConfigContext.Provider value={value}>{children}</AuthConfigContext.Provider>
}
