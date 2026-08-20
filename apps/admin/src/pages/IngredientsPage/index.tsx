import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import BoxIcon from '@gravity-ui/icons/Box'
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
  SelectField,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useIngredients } from '@repo/api'
import type { Ingredient, IngredientInput } from '@repo/domain'
import { IngredientFormModal } from '../../components/IngredientFormModal'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

export const IngredientsPage = () => {
  const { ingredients, isLoading, isMutating, create, update, toggle } = useIngredients()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<Ingredient | null | undefined>(undefined)

  const closeForm = () => setSelected(undefined)

  const handleSubmit = async (input: IngredientInput) => {
    if (selected) await update(selected.id, input)
    else await create(input)
    closeForm()
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return ingredients.filter((ingredient) => {
      const matchesSearch = !query || ingredient.name.toLowerCase().includes(query)
      const matchesStatus = !status || (status === 'active' ? ingredient.active : !ingredient.active)
      return matchesSearch && matchesStatus
    })
  }, [ingredients, search, status])

  const columns: DataTableColumn<Ingredient>[] = [
    { key: 'name', header: 'Nombre', render: (ingredient) => <Strong>{ingredient.name}</Strong> },
    {
      key: 'unit',
      header: 'Unidad',
      render: (ingredient) => <Muted fontSize="sm">{ingredient.unit}</Muted>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (ingredient) => (
        <Muted fontSize="sm">{ingredient.active ? 'Activo' : 'Inactivo'}</Muted>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (ingredient) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => setSelected(ingredient)}>
            Editar
          </GhostButton>
          <ToggleSwitch
            checked={ingredient.active}
            onChange={(checked) => toggle(ingredient.id, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${ingredient.name}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Ingredientes</PageTitle>
        <Muted>Mantené el catálogo de materias primas usadas en las recetas.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar ingrediente..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Estado: Todos"
            width="180px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => setSelected(null)}>
          Nuevo ingrediente
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<BoxIcon width={40} height={40} />}
          title="Sin ingredientes"
          description="No hay ingredientes que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(ingredient) => ingredient.id}
          isLoading={isLoading}
          emptyTitle="Sin ingredientes"
          emptyDescription="No hay ingredientes para mostrar."
        />
      )}

      {selected !== undefined ? (
        <IngredientFormModal
          ingredient={selected}
          isSubmitting={isMutating}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </WidePageContainer>
  )
}
