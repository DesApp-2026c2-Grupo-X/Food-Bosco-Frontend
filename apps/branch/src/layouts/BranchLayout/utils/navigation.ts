import House from '@gravity-ui/icons/House'
import Tag from '@gravity-ui/icons/Tag'
import Receipt from '@gravity-ui/icons/Receipt'
import Box from '@gravity-ui/icons/Box'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import Persons from '@gravity-ui/icons/Persons'
import Person from '@gravity-ui/icons/Person'
import type { DashboardNavItem, DashboardNavSection } from '@repo/components'
import { routes } from '../../../routes'

export const navSections: DashboardNavSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true },
      { id: 'products', label: 'Productos', path: routes.products, icon: Tag },
      { id: 'orders', label: 'Pedidos', path: routes.orders, icon: Receipt },
      { id: 'stock', label: 'Stock', path: routes.stock, icon: Box },
    ],
  },
  {
    id: 'reports',
    label: 'Reportes',
    items: [
      { id: 'reports', label: 'Productos', path: routes.reports, icon: ChartColumn },
      { id: 'customerReports', label: 'Clientes', path: routes.reportsCustomers, icon: Persons },
    ],
  },
  {
    id: 'profile',
    items: [{ id: 'profile', label: 'Perfil', path: routes.profile, icon: Person }],
  },
]

export const navItems: DashboardNavItem[] = navSections.flatMap((section) => section.items)
