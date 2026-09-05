import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import BoxIcon from '@gravity-ui/icons/Box'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  FilterBar,
  Muted,
  OutlineButton,
  PageTitle,
  SearchInput,
  SelectField,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useBranches, useGlobalStock } from '@repo/api'
import type { BranchStock } from '@repo/domain'
import { AdjustStockModal } from '../../components/AdjustStockModal'

export const StockPage = () => {
  const { stock, isLoading, isAdjusting, adjust } = useGlobalStock()
  const { branches } = useBranches()
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('')
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const branchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? `Sucursal ${branchId}`

  const branchOptions = branches.map((b) => ({ value: String(b.id), label: b.name }))

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return stock.filter((row) => {
      const matchesSearch = !query || (row.ingredient?.name ?? '').toLowerCase().includes(query)
      const matchesBranch = !branch || String(row.branchId) === branch
      return matchesSearch && matchesBranch
    })
  }, [stock, search, branch])

  const handleSubmit = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.branchId, selected.ingredientId, delta, reason)
    setSelected(null)
  }

  const columns: DataTableColumn<BranchStock>[] = [
    {
      key: 'ingredient',
      header: 'Ingrediente',
      render: (row) => <Strong>{row.ingredient?.name ?? '—'}</Strong>,
    },
    {
      key: 'branch',
      header: 'Sucursal',
      hideBelow: 'sm',
      render: (row) => <Muted fontSize="sm">{branchName(row.branchId)}</Muted>,
    },
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
        <HStack justify="end">
          <OutlineButton size="sm" onClick={() => setSelected(row)}>
            Ajustar
          </OutlineButton>
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Stock de ingredientes</PageTitle>
        <Muted>Controlá el inventario de ingredientes de todas las sucursales.</Muted>
      </VStack>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar ingrediente..."
        />
        <SelectField
          value={branch}
          onChange={setBranch}
          options={branchOptions}
          placeholder="Sucursal: Todas"
          width="200px"
        />
      </FilterBar>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<BoxIcon width={40} height={40} />}
          title="Sin stock"
          description="No hay ingredientes que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => `${row.branchId}-${row.ingredientId}`}
          isLoading={isLoading}
          emptyTitle="Sin stock"
          emptyDescription="No hay stock para mostrar."
        />
      )}

      <AdjustStockModal
        ingredient={selected}
        isSubmitting={isAdjusting}
        onClose={() => setSelected(null)}
        onSubmit={handleSubmit}
      />
    </WidePageContainer>
  )
}
