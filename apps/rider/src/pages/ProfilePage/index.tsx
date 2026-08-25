import { Avatar, Box, Text } from '@chakra-ui/react'
import Moon from '@gravity-ui/icons/Moon'
import Route from '@gravity-ui/icons/Route'
import { useNavigate } from 'react-router-dom'
import {
  ColorModeButton,
  Muted,
  OutlineButton,
  PageContainer,
  PageTitle,
  Strong,
  Subtle,
  ToggleSwitch,
} from '@repo/components'
import { authRoutes } from '@repo/auth'
import { MOCK_RIDER_USER, useAuthStore, useRiderProfile } from '@repo/api'
import { formatVehicle } from '@repo/domain'
import { useRiderStore } from '../../stores/riderStore'
import { ProfileNav } from './ProfileNav'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user) ?? MOCK_RIDER_USER
  const logout = useAuthStore((state) => state.logout)
  const isOnline = useRiderStore((state) => state.isOnline)
  const setOnline = useRiderStore((state) => state.setOnline)
  const { profile, setAvailability } = useRiderProfile()
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  const toggleAvailability = async (checked: boolean) => {
    setOnline(checked)
    await setAvailability(checked)
  }

  const handleLogout = () => {
    logout()
    navigate(authRoutes.login, { replace: true })
  }

  return (
    <PageContainer>
      <Box>
        <PageTitle marginBottom="1">Mi perfil</PageTitle>
        <Muted>Tus datos y accesos de cuenta.</Muted>
      </Box>

      <Box
        bg="bg.subtle"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="5"
        display="flex"
        alignItems="center"
        gap="4"
      >
        <Avatar.Root size="xl">
          <Avatar.Fallback name={fullName} />
        </Avatar.Root>
        <Box minWidth="0">
          <Strong fontSize="lg">{fullName || 'Sin nombre'}</Strong>
          <Muted fontSize="sm" truncate>
            {user.email}
          </Muted>
          <Subtle fontSize="sm">{profile ? formatVehicle(profile.vehicle) : '—'}</Subtle>
        </Box>
      </Box>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="3.5"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap="3">
          <Box color="brand.600" bg="bg.muted" borderRadius="full" padding="2" display="flex">
            <Route width={18} height={18} />
          </Box>
          <Text fontWeight="medium">Disponibilidad</Text>
        </Box>
        <ToggleSwitch checked={isOnline} onChange={toggleAvailability} ariaLabel="Disponibilidad" />
      </Box>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="3.5"
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" gap="3">
          <Box color="brand.600" bg="bg.muted" borderRadius="full" padding="2" display="flex">
            <Moon width={18} height={18} />
          </Box>
          <Text fontWeight="medium">Apariencia</Text>
        </Box>
        <ColorModeButton />
      </Box>

      <ProfileNav />

      <OutlineButton
        width="full"
        color="danger"
        _hover={{ borderColor: 'danger', bg: 'bg.muted' }}
        onClick={handleLogout}
      >
        Cerrar sesión
      </OutlineButton>
    </PageContainer>
  )
}
