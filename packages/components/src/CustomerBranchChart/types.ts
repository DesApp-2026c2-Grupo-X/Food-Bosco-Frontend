import type { CustomerBranchActivityRow } from '@repo/domain'

export interface CustomerBranchChartProps {
  data: CustomerBranchActivityRow[]
  isLoading: boolean
}
