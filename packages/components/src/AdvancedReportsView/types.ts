import type { SelectFieldOption } from '../SelectField/types'

export type AdvancedReportsScope = 'admin' | 'branch'

export interface AdvancedReportsViewProps {
  description: string
  scope: AdvancedReportsScope
  branchOptions?: SelectFieldOption[]
}
