import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useListFilters } from '../useListFilters'

interface Row {
  id: string
  name: string
  active: boolean
}

const rows: Row[] = [
  { id: '1', name: 'Hamburguesas', active: true },
  { id: '2', name: 'Pizzas', active: false },
  { id: '3', name: 'Bebidas', active: true },
]

const setup = (defaultStatus = '') =>
  renderHook(() =>
    useListFilters(rows, {
      searchKeys: [(row) => row.name],
      matchesStatus: (row, status) => (status === 'active' ? row.active : !row.active),
      defaultStatus,
    }),
  )

describe('useListFilters', () => {
  it('returns all rows by default', () => {
    const { result } = setup()
    expect(result.current.rows).toHaveLength(3)
    expect(result.current.hasFilters).toBe(false)
  })

  it('filters case-insensitively by search term', () => {
    const { result } = setup()
    act(() => result.current.setSearch('PIZ'))
    expect(result.current.rows.map((row) => row.id)).toEqual(['2'])
    expect(result.current.hasFilters).toBe(true)
  })

  it('ignores surrounding whitespace in the search', () => {
    const { result } = setup()
    act(() => result.current.setSearch('  bebidas  '))
    expect(result.current.rows.map((row) => row.id)).toEqual(['3'])
  })

  it('combines the search and status filters', () => {
    const { result } = setup()
    act(() => {
      result.current.setSearch('a')
      result.current.setStatus('active')
    })
    expect(result.current.rows.map((row) => row.id)).toEqual(['1', '3'])

    act(() => result.current.setStatus('inactive'))
    expect(result.current.rows.map((row) => row.id)).toEqual(['2'])
  })

  it('clears both filters', () => {
    const { result } = setup()
    act(() => {
      result.current.setSearch('pizza')
      result.current.setStatus('inactive')
    })
    act(() => result.current.clearFilters())

    expect(result.current.search).toBe('')
    expect(result.current.status).toBe('')
    expect(result.current.rows).toHaveLength(3)
    expect(result.current.hasFilters).toBe(false)
  })

  it('treats a non-default initial status as an active filter', () => {
    const { result } = setup('active')
    expect(result.current.hasFilters).toBe(false)
    expect(result.current.rows.map((row) => row.id)).toEqual(['1', '3'])
  })
})
