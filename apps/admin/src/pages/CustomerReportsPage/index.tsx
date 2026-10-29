import { CustomerInsightsView } from '@repo/components'
import { useBranches } from '@repo/api'

export const CustomerReportsPage = () => {
  const { branches } = useBranches()
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }))

  return (
    <CustomerInsightsView
      description="Actividad y recurrencia de clientes en toda la plataforma."
      scope="admin"
      branchOptions={branchOptions}
    />
  )
}
