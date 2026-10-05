import type { ReportPeriodPreset } from '@repo/domain'
import type { SelectFieldOption } from '../SelectField/types'

export interface ReportFiltersProps {
  preset: ReportPeriodPreset
  onPresetChange: (preset: ReportPeriodPreset) => void
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  branchId?: string
  onBranchChange?: (value: string) => void
  branches?: SelectFieldOption[]
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: SelectFieldOption[]
}
