import type { ComponentType, SVGProps } from 'react'

export interface MobileNavItem {
  id: string
  label: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  badge?: number
  exact?: boolean
}

export interface MobileNavProps {
  items: MobileNavItem[]
  ariaLabel?: string
}
