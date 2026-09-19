import type { ReactNode } from 'react'

export interface AppShellProps {
  header: ReactNode
  showHeader: boolean
  mobileNav: ReactNode
  overlays?: ReactNode
  children: ReactNode
}
