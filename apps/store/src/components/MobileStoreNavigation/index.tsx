import { MobileNav } from '@repo/components'
import type { MobileNavItem } from '@repo/components'
import House from '@gravity-ui/icons/House'
import LayoutCells from '@gravity-ui/icons/LayoutCells'
import ListUl from '@gravity-ui/icons/ListUl'
import Person from '@gravity-ui/icons/Person'
import ShoppingCart from '@gravity-ui/icons/ShoppingCart'
import { routes } from '../../routes'
import { useCartCount } from '../CartButton/hooks/useCartCount'

export const MobileStoreNavigation = () => {
  const { count } = useCartCount()

  const items: MobileNavItem[] = [
    { id: 'home', label: 'Inicio', path: routes.home, icon: House, exact: true },
    { id: 'catalog', label: 'Catálogo', path: routes.catalog, icon: LayoutCells },
    { id: 'cart', label: 'Carrito', path: routes.cart, icon: ShoppingCart, badge: count },
    { id: 'orders', label: 'Pedidos', path: routes.orders, icon: ListUl },
    { id: 'profile', label: 'Perfil', path: routes.profile, icon: Person },
  ]

  return <MobileNav items={items} />
}
