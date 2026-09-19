import { Avatar, Box } from '@chakra-ui/react'
import GeoPin from '@gravity-ui/icons/GeoPin'
import House from '@gravity-ui/icons/House'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import { useNavigate } from 'react-router-dom'
import { Muted, ProfileScreen, Strong, Subtle } from '@repo/components'
import { routes } from '../../routes'
import { authRoutes } from '@repo/auth'
import { useAuthStore } from '@repo/api'
import { useProfile } from '@repo/api'

const accountItems = [
  {
    id: 'edit',
    label: 'Editar perfil',
    path: routes.profileEdit,
    icon: <PencilToSquare width={18} height={18} />,
  },
  {
    id: 'addresses',
    label: 'Mis direcciones',
    path: routes.profileAddresses,
    icon: <GeoPin width={18} height={18} />,
  },
  {
    id: 'branches',
    label: 'Sucursales',
    path: routes.branches,
    icon: <House width={18} height={18} />,
  },
]

export const ProfilePage = () => {
  const { user } = useProfile()
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login, { replace: true })
  }

  return (
    <ProfileScreen
      title="Mi perfil"
      description="Tus datos y accesos de cuenta."
      appearance
      navItems={accountItems}
      navFallbackIcon={<House width={18} height={18} />}
      onLogout={handleLogout}
      identity={
        <>
          <Avatar.Root size="xl">
            <Avatar.Fallback name={fullName} />
          </Avatar.Root>
          <Box minWidth="0">
            <Strong fontSize="lg">{fullName || 'Sin nombre'}</Strong>
            <Muted fontSize="sm" truncate>
              {user?.email}
            </Muted>
            <Subtle fontSize="sm">{user?.phone}</Subtle>
          </Box>
        </>
      }
    />
  )
}
