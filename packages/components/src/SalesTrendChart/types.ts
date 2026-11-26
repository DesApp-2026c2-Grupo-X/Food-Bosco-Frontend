import type { ReportGroupBy, ReportPeriodPreset, SalesSeriesPoint } from '@repo/domain'

export interface SalesTrendChartProps {
  data: SalesSeriesPoint[]
  isLoading?: boolean
  groupBy?: ReportGroupBy
  preset?: ReportPeriodPreset
  spanDays?: number
}
