import { useState } from 'react'
import Tag from '@gravity-ui/icons/Tag'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ActiveStatusText,
  ConfirmDeleteModal,
  CrudListPage,
  type DataTableColumn,
  GhostButton,
  PrimaryButton,
  RowEditToggleActions,
  SearchInput,
  SelectField,
  Strong,
  useListFilters,
} from '@repo/components'
import { useAdminCategories } from '@repo/api'
import {
  ACTIVE_FILTER_OPTIONS_FEMININE,
  matchesActiveStatus,
  type Category,
  type CategoryInput,
} from '@repo/domain'
import { CategoryFormModal } from '../../components/CategoryFormModal'
import { categoryEditPath, routes } from '../../routes'

const searchKeys = [(category: Category) => category.name]

const matchesStatus = (category: Category, status: string) =>
  matchesActiveStatus(category.active, status)

export const CategoriesPage = () => {
  const { categories, isLoading, isMutating, create, update, toggle, remove } = useAdminCategories()
  const { rows, search, setSearch, status, setStatus } = useListFilters(categories, {
    searchKeys,
    matchesStatus,
  })
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { categoryId } = useParams()

  const isNew = pathname === routes.categoryNew
  const editingId = categoryId ?? null
  const editing = editingId != null ? (categories.find((c) => c.id === editingId) ?? null) : null
  const formOpen = isNew || (editingId != null && editing != null)

  const closeForm = () => navigate(routes.categories)

  const handleSubmit = async (input: CategoryInput) => {
    if (isNew) await create(input)
    else if (editingId != null) await update(editingId, input)
    closeForm()
  }

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Nombre', render: (category) => <Strong>{category.name}</Strong> },
    {
      key: 'status',
      header: 'Estado',
      render: (category) => <ActiveStatusText active={category.active} feminine />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (category) => (
        <RowEditToggleActions
          onEdit={() => navigate(categoryEditPath(category.id))}
          checked={category.active}
          onToggle={(checked) => toggle(category.id, checked)}
          disabled={isMutating}
          ariaLabel={`Estado de ${category.name}`}
          extra={
            <GhostButton size="sm" color="danger" onClick={() => setConfirmDelete(category)}>
              Eliminar
            </GhostButton>
          }
        />
      ),
    },
  ]

  return (
    <CrudListPage
      title="Categorías"
      description="Definí las categorías del catálogo."
      toolbar={
        <>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar categoría..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={ACTIVE_FILTER_OPTIONS_FEMININE}
            placeholder="Estado: Todas"
            width="filterControlSm"
          />
        </>
      }
      action={
        <PrimaryButton size="md" onClick={() => navigate(routes.categoryNew)}>
          Nueva categoría
        </PrimaryButton>
      }
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      getRowKey={(category) => category.id}
      emptyIcon={<Tag width={40} height={40} />}
      emptyTitle="Sin categorías"
      emptyDescription="No hay categorías que coincidan con los filtros."
      modals={
        <>
          {formOpen ? (
            <CategoryFormModal
              category={isNew ? null : editing}
              isSubmitting={isMutating}
              onClose={closeForm}
              onSubmit={handleSubmit}
            />
          ) : null}

          <ConfirmDeleteModal
            open={confirmDelete !== null}
            title="Eliminar categoría"
            description={`¿Eliminar la categoría ${confirmDelete?.name}? Esta acción no se puede deshacer.`}
            isSubmitting={isMutating}
            onClose={() => setConfirmDelete(null)}
            onConfirm={async () => {
              if (confirmDelete) await remove(confirmDelete.id)
              setConfirmDelete(null)
            }}
          />
        </>
      }
    />
  )
}
