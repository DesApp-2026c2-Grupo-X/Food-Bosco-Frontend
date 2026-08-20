import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import Route from '@gravity-ui/icons/Route'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  FilterBar,
  GhostButton,
  Muted,
  PageTitle,
  PrimaryButton,
  SearchInput,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useOrderStates } from '@repo/api'
import type { OrderState, OrderStateInput } from '@repo/domain'
import { OrderStateFormModal } from '../../components/OrderStateFormModal'

export const StatesPage = () => {
  const { states, isLoading, isMutating, create, update, toggle } = useOrderStates()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<OrderState | null | undefined>(undefined)

  const closeForm = () => setSelected(undefined)

  const handleSubmit = async (input: OrderStateInput) => {
    if (selected) await update(selected.code, input)
    else await create(input)
    closeForm()
  }

  const sorted = useMemo(
    () => [...states].sort((a, b) => a.order - b.order),
    [states],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return sorted
    return sorted.filter(
      (state) =>
        state.code.toLowerCase().includes(query) || state.name.toLowerCase().includes(query),
    )
  }, [sorted, search])

  const columns: DataTableColumn<OrderState>[] = [
    { key: 'code', header: 'Código', render: (state) => <Strong>{state.code}</Strong> },
    { key: 'name', header: 'Nombre visible', render: (state) => <Muted fontSize="sm">{state.name}</Muted> },
    {
      key: 'order',
      header: 'Orden',
      render: (state) => <Muted fontSize="sm">{state.order}</Muted>,
    },
    {
      key: 'status',
      header: 'Activo',
      render: (state) => <Muted fontSize="sm">{state.active ? 'Sí' : 'No'}</Muted>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (state) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => setSelected(state)}>
            Editar
          </GhostButton>
          <ToggleSwitch
            checked={state.active}
            onChange={(checked) => toggle(state.code, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${state.code}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Estados generales</PageTitle>
        <Muted>Administrá el catálogo de estados de pedido. Cambiarlos puede afectar el flujo.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar estado..."
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => setSelected(null)}>
          Nuevo estado
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<Route width={40} height={40} />}
          title="Sin estados"
          description="No hay estados que coincidan con la búsqueda."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(state) => state.code}
          isLoading={isLoading}
          emptyTitle="Sin estados"
          emptyDescription="No hay estados para mostrar."
        />
      )}

      {selected !== undefined ? (
        <OrderStateFormModal
          state={selected}
          isSubmitting={isMutating}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </WidePageContainer>
  )
}
