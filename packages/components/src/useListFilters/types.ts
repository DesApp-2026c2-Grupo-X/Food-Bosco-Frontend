import type { Dispatch, SetStateAction } from 'react'

export interface UseListFiltersOptions<T> {
  searchKeys: ReadonlyArray<(row: T) => string | null | undefined>
  matchesStatus?: (row: T, status: string) => boolean
  defaultStatus?: string
}

export interface UseListFiltersResult<T> {
  rows: T[]
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  status: string
  setStatus: Dispatch<SetStateAction<string>>
  hasFilters: boolean
  clearFilters: () => void
}
