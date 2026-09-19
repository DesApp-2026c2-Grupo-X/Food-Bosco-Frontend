import { Link as ChakraLink } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { AppHeader, createLogo, useDesktopNavigation } from '@repo/components'
import { routes } from '../../routes'
import { HeaderActions } from './HeaderActions'
import { getDesktopNavItems } from './utils/navigation'
import logoLight from '../../assets/logo-light.svg'
import logoDark from '../../assets/logo-dark.svg'

const Logo = createLogo(logoLight, logoDark)

export const RiderHeader = () => {
  const { navItems, isActive } = useDesktopNavigation(getDesktopNavItems())

  return (
    <AppHeader
      navItems={navItems}
      isActive={isActive}
      logo={
        <ChakraLink asChild>
          <NavLink to={routes.home} aria-label="Ir al inicio">
            <Logo height="40px" />
          </NavLink>
        </ChakraLink>
      }
      actions={<HeaderActions />}
    />
  )
}
