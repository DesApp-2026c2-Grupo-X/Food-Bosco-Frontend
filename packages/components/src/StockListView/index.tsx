import { useMemo, useState } from 'react'
import BoxIcon from '@gravity-ui/icons/Box'
import type { BranchStock } from '@repo/domain'
import { DataTable } from '../DataTable'
import type { DataTableColumn } from '../DataTable/types'
import { ListToolbar } from '../ListToolbar'
import { Muted } from '../Muted'
import { PageHeader } from '../PageHeader'
import { OutlineButton } from '../Button'
import { SearchInput } from '../SearchInput'
import { Strong } from '../Strong'
import { WidePageContainer } from '../WidePageContainer'
import type { StockListViewProps } from './types'

export const StockListView = ({
  rows,
  isLoading,
  isAdjusting,
  title,
  description,
  onAdjust,
  showBranch = false,
  branchName,
  filters,
  emptyTitle = 'Sin stock',
  emptyDescription = 'No hay ingredientes que coincidan con los filtros.',
}: StockListViewProps) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => (row.ingredient?.name ?? '').toLowerCase().includes(query))
  }, [rows, search])

  const columns: DataTableColumn<BranchStock>[] = [
    {
      key: 'ingredient',
      header: 'Ingrediente',
      render: (row) => <Strong>{row.ingredient?.name ?? '—'}</Strong>,
    },
    ...(showBranch
      ? [
          {
            key: 'branch',
            header: 'Sucursal',
            hideBelow: 'sm' as const,
            render: (row: BranchStock) => (
              <Muted fontSize="sm">{branchName?.(row.branchId) ?? row.branchId}</Muted>
            ),
          },
        ]
      : []),
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (row) => (
        <Muted fontSize="sm">
          {row.quantity} {row.ingredient?.unit ?? '—'}
        </Muted>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <OutlineButton size="sm" onClick={() => onAdjust(row)} loading={isAdjusting}>
          Ajustar
        </OutlineButton>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <PageHeader title={title} description={description} />

      <ListToolbar
        filters={
          <>
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar ingrediente..."
            />
            {filters}
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(row) => `${row.branchId}-${row.ingredientId}`}
        isLoading={isLoading}
        emptyIcon={<BoxIcon width={40} height={40} />}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </WidePageContainer>
  )
}
