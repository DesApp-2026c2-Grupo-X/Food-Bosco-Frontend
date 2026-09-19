import type { ReactNode } from 'react'
import type { BranchStock } from '@repo/domain'

export interface StockListViewProps {
  rows: BranchStock[]
  isLoading: boolean
  isAdjusting: boolean
  title: string
  description: string
  onAdjust: (row: BranchStock) => void
  showBranch?: boolean
  branchName?: (branchId: string) => string
  filters?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
}
