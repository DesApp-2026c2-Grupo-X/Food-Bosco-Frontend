import { AdvancedReportsView } from '@repo/components'
import { useBranches } from '@repo/api'

export const ReportsPage = () => {
  const { branches } = useBranches()
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }))

  return (
    <AdvancedReportsView
      description="Métricas consolidadas de todas las sucursales."
      scope="admin"
      branchOptions={branchOptions}
    />
  )
}
