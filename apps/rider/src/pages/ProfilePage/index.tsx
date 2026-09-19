import { Avatar, Box, HStack } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import Route from '@gravity-ui/icons/Route'
import { useNavigate } from 'react-router-dom'
import { Card, Muted, ProfileScreen, Strong, Subtle, SwitchRow } from '@repo/components'
import { authRoutes } from '@repo/auth'
import { useAuthStore, useRiderProfile } from '@repo/api'
import { buildVehicleDescription } from '@repo/domain'
import { routes } from '../../routes'
import { useRiderStore } from '../../stores/riderStore'

const accountItems = [
  {
    id: 'edit',
    label: 'Editar perfil',
    path: routes.profileEdit,
    icon: <PencilToSquare width={18} height={18} />,
  },
  {
    id: 'vehicle',
    label: 'Vehículo',
    path: routes.profileVehicle,
    icon: <Car width={18} height={18} />,
  },
]

export const ProfilePage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { profile, setAvailability } = useRiderProfile()
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  const toggleAvailability = async (checked: boolean) => {
    setOnline(checked)
    await setAvailability(checked)
  }

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
      navFallbackIcon={<PencilToSquare width={18} height={18} />}
      onLogout={handleLogout}
      beforeNav={
        <Card padding="3.5">
          <HStack gap="3">
            <Box
              color="brand.600"
              bg="bg.muted"
              borderRadius="full"
              padding="2"
              display="flex"
              flexShrink="0"
            >
              <Route width={18} height={18} />
            </Box>
            <Box flex="1">
              <SwitchRow
                label="Disponibilidad"
                checked={isOnline}
                onChange={toggleAvailability}
                ariaLabel="Disponibilidad"
              />
            </Box>
          </HStack>
        </Card>
      }
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
            <Subtle fontSize="sm">
              {profile ? buildVehicleDescription(profile.vehicle) : '—'}
            </Subtle>
          </Box>
        </>
      }
    />
  )
}
