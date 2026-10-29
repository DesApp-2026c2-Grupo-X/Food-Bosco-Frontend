import { Badge, Box, HStack } from '@chakra-ui/react'
import BoxIcon from '@gravity-ui/icons/Box'
import {
  STOCK_ALERT_LABELS,
  STOCK_ALERT_PALETTE,
  STOCK_STATUS_FILTER_OPTIONS,
  getStockAlertLevel,
  matchesStockStatus,
  type BranchStock,
} from '@repo/domain'
import { OutlineButton } from '../Button'
import { Chip } from '../Chip'
import { CrudListPage } from '../CrudListPage'
import type { DataTableColumn } from '../DataTable/types'
import { Muted, Strong } from '../typography'
import { useListFilters } from '../useListFilters'
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
  const list = useListFilters(rows, {
    searchKeys: STOCK_SEARCH_KEYS,
    matchesStatus: matchesStockStatus,
  })

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
      render: (row) => {
        const level = getStockAlertLevel(row)
        return (
          <HStack gap="2" wrap="wrap">
            <Muted fontSize="sm">
              {row.quantity} {row.ingredient?.unit ?? '—'}
            </Muted>
            {level !== 'ok' ? (
              <Badge
                colorPalette={STOCK_ALERT_PALETTE[level]}
                variant="subtle"
                borderRadius="full"
                paddingX="2.5"
                paddingY="0.5"
                display="inline-flex"
                alignItems="center"
                gap="1.5"
              >
                <Box width="6px" height="6px" borderRadius="full" bg="currentColor" />
                {STOCK_ALERT_LABELS[level]}
              </Badge>
            ) : null}
          </HStack>
        )
      },
    },
    {
      key: 'minQuantity',
      header: 'Stock mín.',
      hideBelow: 'sm',
      render: (row) => {
        const min = row.ingredient?.minQuantity ?? 0
        const unit = row.ingredient?.unit ?? ''
        return <Muted fontSize="sm">{min > 0 ? `${min} ${unit}`.trim() : '—'}</Muted>
      },
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
      toolbar={
        <>
          {filters}
          {STOCK_STATUS_FILTER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={list.status === option.value}
              onClick={() => list.setStatus(list.status === option.value ? '' : option.value)}
            />
          ))}
        </>
      }
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
