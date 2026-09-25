import { AppHeader, createLogo, LogoLink, useDesktopNavigation } from '@repo/components'
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
        <LogoLink to={routes.home}>
          <Logo height="40px" />
        </LogoLink>
      }
      actions={<HeaderActions />}
    />
  )
}
