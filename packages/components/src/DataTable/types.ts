import type { ReactNode } from 'react'

export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  hideBelow?: ResponsiveBreakpoint
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  isLoading?: boolean
  error?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
  skeletonRows?: number
}
