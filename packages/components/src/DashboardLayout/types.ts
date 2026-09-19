import type { ComponentType, ReactNode, SVGProps } from 'react'

export interface DashboardNavItem {
  id: string
  label: string
  path: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}

export interface DashboardNavSection {
  id: string
  label?: string
  items: DashboardNavItem[]
}

export interface DashboardLogoProps {
  height?: number | string
  className?: string
}

export interface DashboardLayoutProps {
  navSections: DashboardNavSection[]
  logo: ComponentType<DashboardLogoProps>
  brandSubtitle: string
  headerTitle: string
  sidebarScrollable?: boolean
  sidebarFooter?: ReactNode
  mobileItemPaddingY?: string
  onLogout: () => void
  headerActions?: ReactNode
  extras?: ReactNode
  children: ReactNode
}
