import { VStack } from '@chakra-ui/react'
import { BackButton, Muted, PageContainer, PageTitle } from '@repo/components'
import { ProfileForm } from './ProfileForm'

export const EditProfilePage = () => {
  return (
    <PageContainer>
      <BackButton />
      <VStack align="start" gap="1">
        <PageTitle>Editar perfil</PageTitle>
        <Muted>Actualizá tus datos personales.</Muted>
      </VStack>
      <ProfileForm />
    </PageContainer>
  )
}
