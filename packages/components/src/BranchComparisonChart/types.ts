import type { BranchPerformanceRow } from '@repo/domain'

export interface BranchComparisonChartProps {
  data: BranchPerformanceRow[]
  isLoading?: boolean
}
