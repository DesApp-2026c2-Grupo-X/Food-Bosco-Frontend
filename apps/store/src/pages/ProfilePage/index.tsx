import GeoPin from '@gravity-ui/icons/GeoPin'
import House from '@gravity-ui/icons/House'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import { ProfileIdentity, ProfileScreen } from '@repo/components'
import { useLogout } from '@repo/auth'
import { useProfile } from '@repo/api'
import { routes } from '../../routes'

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
  const handleLogout = useLogout()

  return (
    <ProfileScreen
      title="Mi perfil"
      description="Tus datos y accesos de cuenta."
      appearance
      navItems={accountItems}
      navFallbackIcon={<House width={18} height={18} />}
      onLogout={handleLogout}
      identity={
        <ProfileIdentity
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
          subtitle={user?.phone}
        />
      }
    />
  )
}
