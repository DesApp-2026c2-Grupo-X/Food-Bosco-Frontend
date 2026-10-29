import type { BranchStock } from '@repo/domain'

export interface LowStockAlertsSectionProps {
  alerts: BranchStock[]
  isAdjusting?: boolean
  showBranch?: boolean
  branchName?: (branchId: string) => string
  stockPath?: string
  onAdjust?: (row: BranchStock) => void
}
