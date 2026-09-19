import { useState } from 'react'
import BoxIcon from '@gravity-ui/icons/Box'
import {
  ActiveStatusText,
  CrudListPage,
  type DataTableColumn,
  Muted,
  PrimaryButton,
  RowEditToggleActions,
  SearchInput,
  SelectField,
  Strong,
  useListFilters,
} from '@repo/components'
import { useIngredients } from '@repo/api'
import {
  ACTIVE_FILTER_OPTIONS,
  matchesActiveStatus,
  type Ingredient,
  type IngredientInput,
} from '@repo/domain'
import { IngredientFormModal } from '../../components/IngredientFormModal'

const searchKeys = [(ingredient: Ingredient) => ingredient.name]

const matchesStatus = (ingredient: Ingredient, status: string) =>
  matchesActiveStatus(ingredient.active, status)

export const IngredientsPage = () => {
  const { ingredients, isLoading, isMutating, create, update, toggle } = useIngredients()
  const { rows, search, setSearch, status, setStatus } = useListFilters(ingredients, {
    searchKeys,
    matchesStatus,
  })
  const [selected, setSelected] = useState<Ingredient | null | undefined>(undefined)

  const closeForm = () => setSelected(undefined)

  const handleSubmit = async (input: IngredientInput) => {
    if (selected) await update(selected.id, input)
    else await create(input)
    closeForm()
  }

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
      render: (ingredient) => <ActiveStatusText active={ingredient.active} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (ingredient) => (
        <RowEditToggleActions
          onEdit={() => setSelected(ingredient)}
          checked={ingredient.active}
          onToggle={(checked) => toggle(ingredient.id, checked)}
          disabled={isMutating}
          ariaLabel={`Estado de ${ingredient.name}`}
        />
      ),
    },
  ]

  return (
    <CrudListPage
      title="Ingredientes"
      description="Mantené el catálogo de materias primas usadas en las recetas."
      toolbar={
        <>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar ingrediente..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={ACTIVE_FILTER_OPTIONS}
            placeholder="Estado: Todos"
            width="filterControlSm"
          />
        </>
      }
      action={
        <PrimaryButton size="md" onClick={() => setSelected(null)}>
          Nuevo ingrediente
        </PrimaryButton>
      }
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      getRowKey={(ingredient) => ingredient.id}
      emptyIcon={<BoxIcon width={40} height={40} />}
      emptyTitle="Sin ingredientes"
      emptyDescription="No hay ingredientes que coincidan con los filtros."
      modals={
        selected !== undefined ? (
          <IngredientFormModal
            ingredient={selected}
            isSubmitting={isMutating}
            onClose={closeForm}
            onSubmit={handleSubmit}
          />
        ) : null
      }
    />
  )
}
