import type { CustomerDistributionRow } from '@repo/domain'

export interface CustomerDistributionChartProps {
  title: string
  description: string
  emptyDescription: string
  data: CustomerDistributionRow[]
  isLoading: boolean
}
