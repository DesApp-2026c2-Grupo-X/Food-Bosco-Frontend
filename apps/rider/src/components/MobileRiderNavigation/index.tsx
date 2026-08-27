import { MobileNav } from '@repo/components'
import type { MobileNavItem } from '@repo/components'
import House from '@gravity-ui/icons/House'
import Person from '@gravity-ui/icons/Person'
import Receipt from '@gravity-ui/icons/Receipt'
import { routes } from '../../routes'

export const MobileRiderNavigation = () => {
  const items: MobileNavItem[] = [
    { id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true },
    { id: 'history', label: 'Historial', path: routes.history, icon: Receipt },
    { id: 'profile', label: 'Perfil', path: routes.profile, icon: Person },
  ]

  return <MobileNav items={items} />
}
