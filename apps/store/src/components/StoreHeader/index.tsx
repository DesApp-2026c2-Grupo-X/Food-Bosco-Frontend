import { useDisclosure } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom'
import { AppHeader, createLogo, LogoLink, useDesktopNavigation } from '@repo/components'
import { routes } from '../../routes'
import { CartDrawer } from '../CartDrawer'
import { HeaderActions } from './HeaderActions'
import { desktopNavItems } from './utils/navigation'
import type { StoreHeaderProps } from './types'
import logoLight from '../../assets/logo-light.svg'
import logoDark from '../../assets/logo-dark.svg'

const Logo = createLogo(logoLight, logoDark)

const MOBILE_LOCATION_PATHS: string[] = [routes.home, routes.catalog, routes.cart]

export const StoreHeader = ({ count, onOpenLocation }: StoreHeaderProps) => {
  const { navItems, isActive } = useDesktopNavigation(desktopNavItems)
  const cart = useDisclosure()
  const { pathname } = useLocation()
  const showMobileLocation = MOBILE_LOCATION_PATHS.includes(pathname)

  return (
    <AppHeader
      navItems={navItems}
      isActive={isActive}
      logo={
        <LogoLink to={routes.home}>
          <Logo height="40px" />
        </LogoLink>
      }
      actions={
        <HeaderActions
          count={count}
          onOpenCart={cart.onOpen}
          onOpenLocation={onOpenLocation}
          showMobileLocation={showMobileLocation}
        />
      }
      overlays={<CartDrawer open={cart.open} onClose={cart.onClose} />}
    />
  )
}
