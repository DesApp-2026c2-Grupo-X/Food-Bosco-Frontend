import type { ReactNode } from 'react'

export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  hideBelow?: ResponsiveBreakpoint
  width?: string | number | Record<string, string | number>
  minWidth?: string | number | Record<string, string | number>
  maxWidth?: string | number | Record<string, string | number>
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  isLoading?: boolean
  error?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: ReactNode
  onRowClick?: (row: T) => void
  skeletonRows?: number
}
