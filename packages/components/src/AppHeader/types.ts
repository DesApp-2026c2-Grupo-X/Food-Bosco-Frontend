import type { ReactNode } from 'react'
import type { DesktopNavItem } from '../DesktopNav/types'

export interface AppHeaderProps {
  navItems: DesktopNavItem[]
  isActive: (path: string) => boolean
  logo: ReactNode
  actions: ReactNode
  overlays?: ReactNode
}
