import type { CustomerBuyerSeriesPoint } from '@repo/domain'

export interface CustomerBuyerTrendChartProps {
  data: CustomerBuyerSeriesPoint[]
  isLoading: boolean
}
