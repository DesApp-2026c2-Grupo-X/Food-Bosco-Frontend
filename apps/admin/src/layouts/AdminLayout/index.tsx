import { Box, Link as ChakraLink, Text } from '@chakra-ui/react'
import Person from '@gravity-ui/icons/Person'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@repo/components'
import { MOCK_SUPER_ADMIN, useAuthStore } from '@repo/api'
import { authRoutes } from '@repo/auth'
import { Logo } from '../../components/logo'
import { routes } from '../../routes'
import { navSections } from './utils/navigation'

export const AdminLayout = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user) ?? MOCK_SUPER_ADMIN

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login)
  }

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
      headerActions={
        <ChakraLink
          asChild
          display="flex"
          alignItems="center"
          gap="2"
          paddingX="2"
          paddingY="1.5"
          borderRadius="full"
          color="fg.muted"
          _hover={{ bg: 'bg.muted', color: 'fg' }}
        >
          <NavLink to={routes.profile}>
            <Box
              width="7"
              height="7"
              borderRadius="full"
              bg="brand.600"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
            >
              {initials}
            </Box>
            <Text fontWeight="medium" display={{ base: 'none', lg: 'block' }}>
              {user.firstName} {user.lastName}
            </Text>
          </NavLink>
        </ChakraLink>
      }
      sidebarFooter={
        <ChakraLink
          asChild
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
          <NavLink to={routes.profile}>
            <Person width={20} height={20} />
            Mi perfil
          </NavLink>
        </ChakraLink>
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
