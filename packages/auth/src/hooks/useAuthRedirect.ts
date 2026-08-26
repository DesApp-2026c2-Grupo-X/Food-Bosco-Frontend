import { useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '@repo/domain'
import { useAuthConfig } from '../authConfigContext'

interface LocationState {
  from?: { pathname?: string }
}

export const useAuthRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { defaultPath = '/', adminUrl, redirectByRole } = useAuthConfig()

  return (role?: UserRole) => {
    if (redirectByRole) {
      redirectByRole(role)
      return
    }
    if (role === 'admin' && adminUrl) {
      window.location.assign(adminUrl)
      return
    }
    const from = (location.state as LocationState | null)?.from?.pathname
    navigate(from && from !== '/login' ? from : defaultPath, { replace: true })
  }
}
