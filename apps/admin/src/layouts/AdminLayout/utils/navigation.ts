import House from '@gravity-ui/icons/House'
import Tag from '@gravity-ui/icons/Tag'
import ListUl from '@gravity-ui/icons/ListUl'
import Layers from '@gravity-ui/icons/Layers'
import Receipt from '@gravity-ui/icons/Receipt'
import MapPin from '@gravity-ui/icons/MapPin'
import Box from '@gravity-ui/icons/Box'
import Star from '@gravity-ui/icons/Star'
import Persons from '@gravity-ui/icons/Persons'
import Route from '@gravity-ui/icons/Route'
import Sliders from '@gravity-ui/icons/Sliders'
import ChartColumn from '@gravity-ui/icons/ChartColumn'
import { routes } from '../../../routes'
import type { AdminNavSection } from '../types'

export const navSections: AdminNavSection[] = [
  {
    id: 'home',
    label: 'Inicio',
    items: [{ id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true }],
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    items: [
      { id: 'categories', label: 'Categorías', path: routes.categories, icon: Tag },
      { id: 'products', label: 'Productos', path: routes.products, icon: ListUl },
      { id: 'ingredients', label: 'Ingredientes', path: routes.ingredients, icon: Layers },
    ],
  },
  {
    id: 'operation',
    label: 'Operación',
    items: [
      { id: 'orders', label: 'Pedidos', path: routes.orders, icon: Receipt },
      { id: 'branches', label: 'Sucursales', path: routes.branches, icon: MapPin },
      { id: 'stock', label: 'Stock', path: routes.stock, icon: Box },
      { id: 'promotions', label: 'Promociones', path: routes.promotions, icon: Star },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    items: [
      { id: 'staff', label: 'Personal', path: routes.staff, icon: Persons },
      { id: 'states', label: 'Estados', path: routes.states, icon: Route },
      { id: 'parameters', label: 'Parámetros', path: routes.parameters, icon: Sliders },
    ],
  },
  {
    id: 'reports',
    label: 'Reportes',
    items: [{ id: 'reports', label: 'Productos', path: routes.reports, icon: ChartColumn }],
  },
]
