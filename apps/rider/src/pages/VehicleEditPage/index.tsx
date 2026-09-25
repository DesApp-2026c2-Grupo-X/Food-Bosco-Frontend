import { Box } from '@chakra-ui/react'
import Car from '@gravity-ui/icons/Car'
import { BackButton, Card, Muted, PageContainer, PageHeader, Strong } from '@repo/components'
import { useRiderStore } from '../../stores/riderStore'
import { VehicleForm } from './VehicleForm'

export const VehicleEditPage = () => {
  const isOnline = useRiderStore((state) => state.isOnline)

  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Vehículo" description="Configurá cómo hacés los repartos." />

      {isOnline ? (
        <Card>
          <Box color="brand.600" display="flex" marginBottom="2">
            <Car width={28} height={28} />
          </Box>
          <Strong>No podés cambiar el vehículo mientras estás conectado</Strong>
          <Muted fontSize="sm" marginTop="1">
            Desconectate desde tu perfil para modificarlo.
          </Muted>
        </Card>
      ) : (
        <VehicleForm />
      )}
    </PageContainer>
  )
}
