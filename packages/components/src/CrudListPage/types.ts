import type { ReactNode } from 'react'
import type { DataTableColumn } from '../DataTable/types'

export interface CrudListSearch {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export interface CrudListPageProps<T> {
  title: ReactNode
  description?: ReactNode
  search?: CrudListSearch
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
