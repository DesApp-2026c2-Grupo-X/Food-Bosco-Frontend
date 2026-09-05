import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import Tag from '@gravity-ui/icons/Tag'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  FilterBar,
  GhostButton,
  Muted,
  PageTitle,
  PrimaryButton,
  ResponsiveModal,
  SearchInput,
  SelectField,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { useAdminCategories } from '@repo/api'
import type { Category, CategoryInput } from '@repo/domain'
import { CategoryFormModal } from '../../components/CategoryFormModal'
import { categoryEditPath, routes } from '../../routes'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
]

export const CategoriesPage = () => {
  const { categories, isLoading, isMutating, create, update, toggle, remove } = useAdminCategories()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
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
    else if (editingId != null) await update(editingId, input.name)
    closeForm()
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return categories.filter((category) => {
      const matchesSearch = !query || category.name.toLowerCase().includes(query)
      const matchesStatus = !status || (status === 'active' ? category.active : !category.active)
      return matchesSearch && matchesStatus
    })
  }, [categories, search, status])

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Nombre', render: (category) => <Strong>{category.name}</Strong> },
    {
      key: 'status',
      header: 'Estado',
      render: (category) => <Muted fontSize="sm">{category.active ? 'Activa' : 'Inactiva'}</Muted>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (category) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => navigate(categoryEditPath(category.id))}>
            Editar
          </GhostButton>
          <GhostButton size="sm" color="danger" onClick={() => setConfirmDelete(category)}>
            Eliminar
          </GhostButton>
          <ToggleSwitch
            checked={category.active}
            onChange={(checked) => toggle(category.id, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${category.name}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Categorías</PageTitle>
        <Muted>Definí las categorías del catálogo.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar categoría..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Estado: Todas"
            width="180px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => navigate(routes.categoryNew)}>
          Nueva categoría
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<Tag width={40} height={40} />}
          title="Sin categorías"
          description="No hay categorías que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(category) => category.id}
          isLoading={isLoading}
          emptyTitle="Sin categorías"
          emptyDescription="No hay categorías para mostrar."
        />
      )}

      {formOpen ? (
        <CategoryFormModal
          category={isNew ? null : editing}
          isSubmitting={isMutating}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      <ResponsiveModal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)}>
        <VStack align="stretch" gap="4">
          <Strong fontSize="lg">Eliminar categoría</Strong>
          <Muted>
            ¿Eliminar la categoría {confirmDelete?.name}? Esta acción no se puede deshacer.
          </Muted>
          <HStack justify="end" gap="2">
            <GhostButton onClick={() => setConfirmDelete(null)}>Cancelar</GhostButton>
            <PrimaryButton
              size="md"
              loading={isMutating}
              onClick={async () => {
                if (confirmDelete) await remove(confirmDelete.id)
                setConfirmDelete(null)
              }}
            >
              Eliminar
            </PrimaryButton>
          </HStack>
        </VStack>
      </ResponsiveModal>
    </WidePageContainer>
  )
}
