import { isProductPromotionsEnabled } from '../../../config/featureFlags'
import { routes } from '../../../routes'
import type { NavItem } from '../types'

const items: NavItem[] = [
  { id: 'home', label: 'Inicio', path: routes.home },
  { id: 'catalog', label: 'Catálogo', path: routes.catalog },
  { id: 'promotions', label: 'Promociones', path: routes.promotions },
  { id: 'branches', label: 'Sucursales', path: routes.branches },
  { id: 'orders', label: 'Mis pedidos', path: routes.orders },
]

export const desktopNavItems: NavItem[] = isProductPromotionsEnabled()
  ? items
  : items.filter((item) => item.id !== 'promotions')
