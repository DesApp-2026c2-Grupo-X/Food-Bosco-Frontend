import type { ComponentType, SVGProps } from 'react'

export interface BranchNavItem {
  id: string
  label: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}
