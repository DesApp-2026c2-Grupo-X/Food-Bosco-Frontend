import Person from '@gravity-ui/icons/Person'
import { Outlet, useLocation } from 'react-router-dom'
import { DashboardLayout, MenuLink } from '@repo/components'
import { useLogout } from '@repo/auth'
import { Logo } from '../../components/logo'
import { routes } from '../../routes'
import { navSections } from './utils/navigation'

export const AdminLayout = () => {
  const { pathname } = useLocation()
  const handleLogout = useLogout()

  const profileActive = pathname.startsWith(routes.profile)

  return (
    <DashboardLayout
      logo={Logo}
      navSections={navSections}
      brandSubtitle="Administrador global"
      headerTitle="Administración"
      sidebarScrollable
      mobileItemPaddingY="2.5"
      onLogout={handleLogout}
      sidebarFooter={
        <MenuLink
          to={routes.profile}
          display="flex"
          alignItems="center"
          gap="3"
          paddingX="3"
          paddingY="2.5"
          borderRadius="full"
          color={profileActive ? 'brand.700' : 'fg.muted'}
          bg={profileActive ? 'bg.muted' : 'transparent'}
          _hover={{ color: 'brand.600', bg: 'bg.muted' }}
          fontWeight={profileActive ? 'semibold' : 'normal'}
        >
          <Person width={20} height={20} />
          Mi perfil
        </MenuLink>
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
