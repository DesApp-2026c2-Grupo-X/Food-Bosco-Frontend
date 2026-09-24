import type { ComponentType, SVGProps } from 'react'

export interface AdminNavItem {
  id: string
  label: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}

export interface AdminNavSection {
  id: string
  label: string
  items: AdminNavItem[]
}
