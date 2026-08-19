import House from '@gravity-ui/icons/House'
import Tag from '@gravity-ui/icons/Tag'
import Receipt from '@gravity-ui/icons/Receipt'
import Box from '@gravity-ui/icons/Box'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import Person from '@gravity-ui/icons/Person'
import { routes } from '../../../routes'
import type { BranchNavItem } from '../types'

export const navItems: BranchNavItem[] = [
  { id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true },
  { id: 'products', label: 'Productos', path: routes.products, icon: Tag },
  { id: 'orders', label: 'Pedidos', path: routes.orders, icon: Receipt },
  { id: 'stock', label: 'Stock', path: routes.stock, icon: Box },
  { id: 'reports', label: 'Reportes', path: routes.reports, icon: ChartColumn },
  { id: 'profile', label: 'Perfil', path: routes.profile, icon: Person },
]
