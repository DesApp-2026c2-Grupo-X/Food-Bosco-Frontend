import { useLocation } from 'react-router-dom'
import { isNavItemActive } from '../../navigation'
import type { DesktopNavItem } from '../types'

export const useDesktopNavigation = (items: DesktopNavItem[], homePath = '/') => {
  const { pathname } = useLocation()

  const isActive = (path: string) => isNavItemActive(pathname, path, path === homePath)

  return { navItems: items, isActive }
}
