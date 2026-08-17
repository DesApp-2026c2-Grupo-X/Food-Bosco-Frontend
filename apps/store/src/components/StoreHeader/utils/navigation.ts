import { routes } from '../../../routes'
import type { NavItem } from '../types'

export const desktopNavItems: NavItem[] = [
  { id: 'home', label: 'Inicio', path: routes.home },
  { id: 'catalog', label: 'Catálogo', path: routes.catalog },
  { id: 'branches', label: 'Sucursales', path: routes.branches },
  { id: 'orders', label: 'Mis pedidos', path: routes.orders },
]
