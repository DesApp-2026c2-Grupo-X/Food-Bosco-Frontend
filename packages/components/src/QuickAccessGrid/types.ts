import type { ComponentType, SVGProps } from 'react'

export interface QuickAccessItem {
  id: string
  label: string
  description: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export interface QuickAccessGridProps {
  items: QuickAccessItem[]
  columns?: { base: number; md: number }
}
