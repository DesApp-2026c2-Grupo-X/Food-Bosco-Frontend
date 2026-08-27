import { useLocation } from 'react-router-dom'
import { routes } from '../../../routes'
import { getDesktopNavItems } from '../utils/navigation'
import type { NavItem } from '../types'

interface UseRiderNavigationReturn {
  navItems: NavItem[]
  isActive: (path: string) => boolean
}

export const useRiderNavigation = (): UseRiderNavigationReturn => {
  const { pathname } = useLocation()

  const isActive = (path: string) => {
    if (path === routes.home) return pathname === routes.home
    return pathname.startsWith(path)
  }

  return { navItems: getDesktopNavItems(), isActive }
}
