import { routes } from '../../../routes'
import type { NavItem } from '../types'

export const getDesktopNavItems = (): NavItem[] => [
  { id: 'home', label: 'Inicio', path: routes.home, activePaths: [routes.tripOrderDetail] },
  { id: 'history', label: 'Historial', path: routes.history },
  { id: 'profile', label: 'Perfil', path: routes.profile },
]
