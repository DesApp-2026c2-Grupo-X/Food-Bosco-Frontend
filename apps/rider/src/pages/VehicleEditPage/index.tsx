import { VStack } from '@chakra-ui/react'
import { BackButton, Muted, PageContainer, PageTitle } from '@repo/components'
import { VehicleForm } from './VehicleForm'

export const VehicleEditPage = () => {
  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Vehículo</PageTitle>
        <Muted>Configurá cómo hacés los repartos.</Muted>
      </VStack>
      <VehicleForm />
    </PageContainer>
  )
}
