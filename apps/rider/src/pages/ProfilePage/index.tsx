import { Box, Text, VStack } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import PencilToSquare from '@gravity-ui/icons/PencilToSquare'
import Route from '@gravity-ui/icons/Route'
import {
  Card,
  Muted,
  notifyError,
  ProfileIdentity,
  ProfileScreen,
  ReviewStatsPanel,
  ToggleSwitch,
} from '@repo/components'
import { useLogout } from '@repo/auth'
import {
  getApiErrorMessage,
  useAuthStore,
  useCourierReviewStats,
  useRiderProfile,
  useActiveTrip,
} from '@repo/api'
import { buildVehicleDescription } from '@repo/domain'
import { routes } from '../../routes'
import { useRiderStore } from '../../stores/riderStore'

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const handleLogout = useLogout()
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { profile, setAvailability } = useRiderProfile()
  const { trip } = useActiveTrip()
  const { stats: reviewStats, isLoading: reviewsLoading } = useCourierReviewStats(undefined)
  const availabilityLocked = trip != null

  const navItems = [
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
      disabled: isOnline,
      hint: 'Desconectate para cambiarlo',
    },
  ]

  const toggleAvailability = async (checked: boolean) => {
    if (availabilityLocked) return
    setOnline(checked)
    try {
      await setAvailability(checked)
    } catch (caught) {
      setOnline(!checked)
      notifyError({
        title: 'No pudimos actualizar tu disponibilidad',
        description: getApiErrorMessage(caught),
      })
    }
  }

  return (
    <ProfileScreen
      title="Mi perfil"
      description="Tus datos y accesos de cuenta."
      appearance
      navItems={navItems}
      navFallbackIcon={<PencilToSquare width={18} height={18} />}
      onLogout={handleLogout}
      beforeNav={
        <VStack align="stretch" gap="3">
          <Card padding="3.5" display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap="3">
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
              <Box>
                <Text fontWeight="medium">Disponibilidad</Text>
                {availabilityLocked ? (
                  <Muted fontSize="xs">No podés desconectarte con un viaje en curso.</Muted>
                ) : null}
              </Box>
            </Box>
            <ToggleSwitch
              checked={isOnline}
              onChange={toggleAvailability}
              ariaLabel="Disponibilidad"
              disabled={availabilityLocked}
            />
          </Card>
          <ReviewStatsPanel
            stats={reviewStats}
            isLoading={reviewsLoading}
            title="Tu reputación"
            description="calificaciones de repartidor"
            emptyDescription="Cuando los clientes califiquen sus entregas, vas a ver tu promedio y comentarios acá."
          />
        </VStack>
      }
      identity={
        <ProfileIdentity
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
          subtitle={profile ? buildVehicleDescription(profile.vehicle) : '—'}
        />
      }
    />
  )
}
