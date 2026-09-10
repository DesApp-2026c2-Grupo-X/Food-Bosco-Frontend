import { VStack } from '@chakra-ui/react'
import { BackButton, Muted, PageContainer, PageTitle } from '@repo/components'
import { RiderProfileForm } from './RiderProfileForm'

export const EditProfilePage = () => {
  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Editar perfil</PageTitle>
        <Muted>Actualizá tu vehículo y teléfono.</Muted>
      </VStack>
      <RiderProfileForm />
    </PageContainer>
  )
}
