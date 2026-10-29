import type { SelectFieldOption } from '../SelectField/types'

export type CustomerInsightsScope = 'admin' | 'branch'

export interface CustomerInsightsViewProps {
  description: string
  scope: CustomerInsightsScope
  branchOptions?: SelectFieldOption[]
}
