import type { ReactNode } from 'react'

export interface NavItemProps {
  to: string
  label: string
  active: boolean
  icon?: ReactNode
  variant?: 'pill' | 'sidebar'
  paddingY?: string
  onClick?: () => void
}
