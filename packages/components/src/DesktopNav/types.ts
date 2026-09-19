export interface DesktopNavItem {
  id: string
  label: string
  path: string
}

export interface DesktopNavProps {
  items: DesktopNavItem[]
  isActive: (path: string) => boolean
}
