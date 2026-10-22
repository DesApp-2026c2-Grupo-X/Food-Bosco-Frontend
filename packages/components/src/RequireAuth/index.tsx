import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@repo/api'
import type { RequireAuthProps } from './types'

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url)

const withAuthError = (url: string, code: string) =>
  `${url}${url.includes('?') ? '&' : '?'}authError=${encodeURIComponent(code)}`

export const RequireAuth = ({ loginPath, roles, mockAuth }: RequireAuthProps) => {
  const user = useAuthStore((state) => state.user)
  const bypassAuth = useAuthStore((state) => state.bypassAuth)
  const setBypassAuth = useAuthStore((state) => state.setBypassAuth)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const [roleRejected, setRoleRejected] = useState(false)

  const param = new URLSearchParams(location.search).get('forceAuth')

  useEffect(() => {
    if (param === 'true') setBypassAuth(true)
    if (param === 'false') setBypassAuth(false)
  }, [param, setBypassAuth])

  const effectiveBypass =
    param === 'false' ? false : param === 'true' ? true : mockAuth || bypassAuth

  const roleMismatch = Boolean(!mockAuth && roles && user && !roles.includes(user.role))

  useEffect(() => {
    if (!roleMismatch) return
    setRoleRejected(true)
    logout()
  }, [roleMismatch, logout])

  if (roleMismatch) return null

  if (roleRejected) {
    if (isAbsoluteUrl(loginPath)) {
      window.location.assign(withAuthError(loginPath, 'APP_ROLE_MISMATCH'))
      return null
    }
    return <Navigate to={loginPath} replace state={{ authError: 'APP_ROLE_MISMATCH' }} />
  }

  if (!user && !effectiveBypass) {
    if (isAbsoluteUrl(loginPath)) {
      window.location.assign(loginPath)
      return null
    }
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  return <Outlet />
}
