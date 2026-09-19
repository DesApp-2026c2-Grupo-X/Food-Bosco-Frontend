export interface DesktopNavItem {
  id: string
  label: string
  path: string
  activePaths?: string[]
}

export interface DesktopNavProps {
  items: DesktopNavItem[]
  isActive: (path: string) => boolean
}
