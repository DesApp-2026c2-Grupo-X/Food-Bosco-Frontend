import BoxIcon from '@gravity-ui/icons/Box'
import type { BranchStock } from '@repo/domain'
import { CrudListPage } from '../CrudListPage'
import type { DataTableColumn } from '../DataTable/types'
import { OutlineButton } from '../Button'
import { useListFilters } from '../useListFilters'
import { Muted, Strong } from '../typography'
import type { StockListViewProps } from './types'

const STOCK_SEARCH_KEYS = [(row: BranchStock) => row.ingredient?.name]

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
  const list = useListFilters(rows, { searchKeys: STOCK_SEARCH_KEYS })

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
    <CrudListPage
      title={title}
      description={description}
      search={{
        value: list.search,
        onChange: list.setSearch,
        placeholder: 'Buscar ingrediente...',
      }}
      toolbar={filters}
      columns={columns}
      rows={list.rows}
      getRowKey={(row) => `${row.branchId}-${row.ingredientId}`}
      isLoading={isLoading}
      emptyIcon={<BoxIcon width={40} height={40} />}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  )
}
