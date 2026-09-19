import type { ReactNode } from 'react'
import type { DataTableColumn } from '../DataTable/types'

export interface CrudListPageProps<T> {
  title: ReactNode
  description?: ReactNode
  toolbar?: ReactNode
  action?: ReactNode
  isLoading?: boolean
  rows: T[]
  columns: DataTableColumn<T>[]
  getRowKey: (row: T) => string | number
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  modals?: ReactNode
}
