import type { ReactNode } from 'react'
import type { ProfileNavItem } from '../ProfileNav/types'

export interface ProfileScreenProps {
  title: string
  description: string
  identity: ReactNode
  appearance?: boolean
  beforeNav?: ReactNode
  navItems: ProfileNavItem[]
  navFallbackIcon?: ReactNode
  onLogout: () => void
}
