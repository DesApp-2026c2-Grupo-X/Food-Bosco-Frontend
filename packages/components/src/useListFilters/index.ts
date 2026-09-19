import { useMemo, useState } from 'react'
import type { UseListFiltersOptions, UseListFiltersResult } from './types'

export const useListFilters = <T>(
  sourceRows: T[],
  { searchKeys, matchesStatus, defaultStatus = '' }: UseListFiltersOptions<T>,
): UseListFiltersResult<T> => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(defaultStatus)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sourceRows.filter((row) => {
      const matchesSearch =
        !query ||
        searchKeys.some((key) => {
          const value = key(row)
          return value != null && value.toLowerCase().includes(query)
        })
      const matchesStatusFilter = !matchesStatus || !status || matchesStatus(row, status)
      return matchesSearch && matchesStatusFilter
    })
  }, [sourceRows, search, status, searchKeys, matchesStatus])

  return {
    rows,
    search,
    setSearch,
    status,
    setStatus,
    hasFilters: search.trim() !== '' || status !== defaultStatus,
    clearFilters: () => {
      setSearch('')
      setStatus(defaultStatus)
    },
  }
}
