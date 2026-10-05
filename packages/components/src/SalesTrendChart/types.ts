import type { SalesSeriesPoint } from '@repo/domain'

export interface SalesTrendChartProps {
  data: SalesSeriesPoint[]
  isLoading?: boolean
}
