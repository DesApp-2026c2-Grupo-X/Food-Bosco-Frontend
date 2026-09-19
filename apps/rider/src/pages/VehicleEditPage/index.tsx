import { BackButton, PageContainer, PageHeader } from '@repo/components'
import { VehicleForm } from './VehicleForm'

export const VehicleEditPage = () => {
  return (
    <PageContainer>
      <BackButton />
      <PageHeader title="Vehículo" description="Configurá cómo hacés los repartos." />
      <VehicleForm />
    </PageContainer>
  )
}
