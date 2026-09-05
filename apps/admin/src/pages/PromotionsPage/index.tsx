import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import Star from '@gravity-ui/icons/Star'
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
  SearchInput,
  SelectField,
  Strong,
  ToggleSwitch,
  WidePageContainer,
} from '@repo/components'
import { usePromotions } from '@repo/api'
import type { Promotion, PromotionInput } from '@repo/domain'
import { PromotionFormModal } from '../../components/PromotionFormModal'
import { promotionEditPath, routes } from '../../routes'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
]

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  })

export const PromotionsPage = () => {
  const { promotions, isLoading, isMutating, create, update, toggle } = usePromotions()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { promotionId } = useParams()

  const isNew = pathname === routes.promotionNew
  const editingId = promotionId ?? null
  const editing = editingId != null ? (promotions.find((p) => p.id === editingId) ?? null) : null
  const formOpen = isNew || (editingId != null && editing != null)

  const closeForm = () => navigate(routes.promotions)

  const handleSubmit = async (input: PromotionInput) => {
    if (isNew) await create(input)
    else if (editingId != null) await update(editingId, input)
    closeForm()
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return promotions.filter((promotion) => {
      const matchesSearch = !query || promotion.name.toLowerCase().includes(query)
      const matchesStatus = !status || (status === 'active' ? promotion.active : !promotion.active)
      return matchesSearch && matchesStatus
    })
  }, [promotions, search, status])

  const columns: DataTableColumn<Promotion>[] = [
    { key: 'name', header: 'Nombre', render: (promotion) => <Strong>{promotion.name}</Strong> },
    {
      key: 'start',
      header: 'Desde',
      hideBelow: 'sm',
      render: (promotion) => <Muted fontSize="sm">{formatDate(promotion.startDate)}</Muted>,
    },
    {
      key: 'end',
      header: 'Hasta',
      hideBelow: 'sm',
      render: (promotion) => <Muted fontSize="sm">{formatDate(promotion.endDate)}</Muted>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (promotion) => (
        <Muted fontSize="sm">{promotion.active ? 'Activa' : 'Inactiva'}</Muted>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (promotion) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => navigate(promotionEditPath(promotion.id))}>
            Editar
          </GhostButton>
          <ToggleSwitch
            checked={promotion.active}
            onChange={(checked) => toggle(promotion.id, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${promotion.name}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Promociones</PageTitle>
        <Muted>Administrá promociones como información general.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar promoción..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Estado: Todas"
            width="180px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => navigate(routes.promotionNew)}>
          Nueva promoción
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<Star width={40} height={40} />}
          title="Sin promociones"
          description="No hay promociones que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(promotion) => promotion.id}
          isLoading={isLoading}
          emptyTitle="Sin promociones"
          emptyDescription="No hay promociones para mostrar."
        />
      )}

      {formOpen ? (
        <PromotionFormModal
          promotion={isNew ? null : editing}
          isSubmitting={isMutating}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}
    </WidePageContainer>
  )
}
