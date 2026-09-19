import type { ReactNode } from 'react'

export interface ProfileNavItem {
  id: string
  label: string
  path: string
  icon: ReactNode
}

export interface ProfileNavProps {
  items: ProfileNavItem[]
  fallbackIcon?: ReactNode
}
