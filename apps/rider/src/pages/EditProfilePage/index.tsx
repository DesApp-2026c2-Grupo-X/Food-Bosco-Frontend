import { BackButton, PageContainer, PageHeader } from '@repo/components'
import { RiderProfileForm } from './RiderProfileForm'

export const EditProfilePage = () => {
  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Editar perfil" description="Actualizá tu vehículo y teléfono." />
      <RiderProfileForm />
    </PageContainer>
  )
}
