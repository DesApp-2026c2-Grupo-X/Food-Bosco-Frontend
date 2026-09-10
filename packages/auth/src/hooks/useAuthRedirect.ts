import { useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '@repo/domain'
import { useAuthConfig } from '../authConfigContext'

interface LocationState {
  from?: { pathname?: string }
}

type RedirectUrlKey = 'branchUrl' | 'adminUrl' | 'riderUrl'

const ROLE_URL_KEY: Record<UserRole, RedirectUrlKey | null> = {
  customer: null,
  branch_admin: 'branchUrl',
  super_admin: 'adminUrl',
  rider: 'riderUrl',
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

    if (role) {
      const urlKey = ROLE_URL_KEY[role]
      if (urlKey && config[urlKey]) {
        window.location.assign(config[urlKey])
        return
      }
    }

    const from = (location.state as LocationState | null)?.from?.pathname
    navigate(from && from !== '/login' ? from : (config.defaultPath ?? '/'), { replace: true })
  }
}
