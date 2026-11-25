import type { CustomerBuyerSeriesPoint, ReportGroupBy, ReportPeriodPreset } from '@repo/domain'

export interface CustomerBuyerTrendChartProps {
  data: CustomerBuyerSeriesPoint[]
  isLoading: boolean
  groupBy?: ReportGroupBy
  preset?: ReportPeriodPreset
  spanDays?: number
}
