import { useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '@repo/domain'
import { useAuthConfig } from '../authConfigContext'

interface LocationState {
  from?: { pathname?: string }
}

export const useAuthRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const config = useAuthConfig()

  return (role?: UserRole) => {
    if (config.redirectByRole) {
      config.redirectByRole(role)
      return
    }

    const from = (location.state as LocationState | null)?.from?.pathname
    navigate(from && from !== '/login' ? from : (config.defaultPath ?? '/'), { replace: true })
  }
}
