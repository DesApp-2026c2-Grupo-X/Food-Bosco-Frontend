import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import BoxIcon from '@gravity-ui/icons/Box'
import {
  EmptyState,
  FilterBar,
  Muted,
  OutlineButton,
  PageTitle,
  SearchInput,
  Strong,
  WidePageContainer,
} from '@repo/components'
import { useBranchStock } from '@repo/api'
import type { BranchStock } from '@repo/domain'
import { AdjustStockModal } from '../../components/AdjustStockModal'

export const StockPage = () => {
  const { stock, isLoading, isAdjusting, adjust } = useBranchStock()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<BranchStock | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return stock
    return stock.filter((row) => row.ingredient.name.toLowerCase().includes(query))
  }, [stock, search])

  const handleSubmit = async (delta: number, reason: string) => {
    if (!selected) return
    await adjust(selected.ingredientId, delta, reason)
    setSelected(null)
  }

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Stock de mi almacén</PageTitle>
        <Muted>Controlá el inventario de ingredientes de tu sucursal.</Muted>
      </VStack>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar ingrediente..."
        />
      </FilterBar>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<BoxIcon width={40} height={40} />}
          title="Sin ingredientes"
          description="No hay ingredientes que coincidan con la búsqueda."
        />
      ) : (
        <VStack align="stretch" gap="3">
          {filtered.map((row) => (
            <HStack
              key={row.ingredientId}
              justify="space-between"
              gap="4"
              bg="bg.panel"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="2xl"
              padding="4"
            >
              <VStack align="start" gap="0.5">
                <Strong>{row.ingredient.name}</Strong>
                <Muted fontSize="sm">
                  {row.quantity} {row.ingredient.unit}
                </Muted>
              </VStack>
              <OutlineButton size="md" onClick={() => setSelected(row)}>
                Ajustar
              </OutlineButton>
            </HStack>
          ))}
        </VStack>
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
