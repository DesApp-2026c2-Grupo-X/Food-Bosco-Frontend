import { matchPath, useLocation } from 'react-router-dom'
import { isNavItemActive } from '../../navigation'
import type { DesktopNavItem } from '../types'

export const useDesktopNavigation = (items: DesktopNavItem[], homePath = '/') => {
  const { pathname } = useLocation()

  const isActive = (path: string) => {
    if (isNavItemActive(pathname, path, path === homePath)) return true
    const item = items.find((entry) => entry.path === path)
    return item?.activePaths?.some((extra) => matchPath(extra, pathname) !== null) ?? false
  }

  return { navItems: items, isActive }
}
