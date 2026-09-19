import { BackButton, PageContainer, PageHeader } from '@repo/components'
import { ProfileForm } from './ProfileForm'

export const EditProfilePage = () => {
  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Editar perfil" description="Actualizá tus datos personales." />
      <ProfileForm />
    </PageContainer>
  )
}
