import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@repo/api"
import type { RequireAuthProps } from "./types"

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url)

export const RequireAuth = ({ loginPath, roles, mockAuth }: RequireAuthProps) => {
  const user = useAuthStore((state) => state.user)
  const bypassAuth = useAuthStore((state) => state.bypassAuth)
  const setBypassAuth = useAuthStore((state) => state.setBypassAuth)
  const location = useLocation()

  const param = new URLSearchParams(location.search).get("forceAuth")

  useEffect(() => {
    if (param === "true") setBypassAuth(true)
    if (param === "false") setBypassAuth(false)
  }, [param, setBypassAuth])

  const effectiveBypass = mockAuth
    ? true
    : param === "false"
      ? false
      : param === "true"
        ? true
        : bypassAuth

  if (!user && !effectiveBypass) {
    if (isAbsoluteUrl(loginPath)) {
      window.location.assign(loginPath)
      return null
    }
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (!mockAuth && roles && user && !roles.includes(user.role)) {
    if (isAbsoluteUrl(loginPath)) {
      window.location.assign(loginPath)
      return null
    }
    return <Navigate to={loginPath} replace />
  }

  return <Outlet />
}
