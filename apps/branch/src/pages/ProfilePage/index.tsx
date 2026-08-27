import { Badge, Box, HStack, VStack } from '@chakra-ui/react'
import { Muted, PageContainer, PageTitle, Strong } from '@repo/components'
import { MOCK_BRANCH_ADMIN, useAuthStore } from '@repo/api'

const ROLE_LABELS: Record<string, string> = {
  branch_admin: 'Encargado de sucursal',
  super_admin: 'Administrador',
  customer: 'Cliente',
  rider: 'Repartidor',
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <HStack justify="space-between" gap="4">
    <Muted fontSize="sm">{label}</Muted>
    <Strong fontSize="sm">{value}</Strong>
  </HStack>
)

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user) ?? MOCK_BRANCH_ADMIN

  return (
    <PageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Mi perfil</PageTitle>
        <Muted>Datos del empleado con sesión iniciada.</Muted>
      </VStack>

      <Box
        bg="bg.panel"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        padding="5"
      >
        <VStack align="start" gap="2">
          <Strong fontSize="lg">
            {user.firstName} {user.lastName}
          </Strong>
          <Badge colorPalette="brand">{ROLE_LABELS[user.role] ?? user.role}</Badge>
        </VStack>
        <VStack align="stretch" gap="3" marginTop="4">
          <Row label="Email" value={user.email} />
          <Row label="Teléfono" value={user.phone} />
        </VStack>
      </Box>
    </PageContainer>
  )
}
