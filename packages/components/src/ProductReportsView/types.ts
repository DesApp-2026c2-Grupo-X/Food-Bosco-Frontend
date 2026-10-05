import type { ReportFilter } from '@repo/domain'

export interface ProductReportsViewProps {
  description: string
  filter?: ReportFilter
  embedded?: boolean
}
