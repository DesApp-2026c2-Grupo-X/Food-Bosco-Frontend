import { useState } from 'react'
import { Badge, HStack, VStack } from '@chakra-ui/react'
import Ticket from '@gravity-ui/icons/Ticket'
import { useNavigate } from 'react-router-dom'
import {
  ActiveStatusText,
  ConfirmDeleteModal,
  CrudListPage,
  type DataTableColumn,
  GhostButton,
  Muted,
  PrimaryButton,
  RowEditToggleActions,
  SearchInput,
  SelectField,
  Strong,
  notifyError,
  notifySuccess,
  useListFilters,
} from '@repo/components'
import { getApiErrorMessage, useAdminPromotions } from '@repo/api'
import {
  ACTIVE_FILTER_OPTIONS_FEMININE,
  describePromotion,
  matchesActiveStatus,
  type Promotion,
} from '@repo/domain'
import { promotionEditPath, routes } from '../../routes'

const PROMOTION_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Porcentaje' },
  { value: 'FIXED_AMOUNT', label: 'Monto fijo' },
  { value: 'BUY_X_GET_Y', label: 'NxM' },
]

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Porcentaje',
  FIXED_AMOUNT: 'Monto fijo',
  BUY_X_GET_Y: 'NxM',
}

const searchKeys = [
  (p: Promotion) => p.name,
  (p: Promotion) => p.code ?? '',
  (p: Promotion) => p.description ?? '',
]

const matchesStatus = (p: Promotion, status: string) => matchesActiveStatus(p.active, status)

export const PromotionsPage = () => {
  const { promotions = [], isLoading, isMutating, toggle, remove } = useAdminPromotions()
  const [typeFilter, setTypeFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null)

  const { rows, search, setSearch, status, setStatus } = useListFilters(promotions, {
    searchKeys,
    matchesStatus,
  })

  const filteredRows = typeFilter ? rows.filter((p) => p.type === typeFilter) : rows

  const navigate = useNavigate()

  const columns: DataTableColumn<Promotion>[] = [
    {
      key: 'name',
      header: 'Promoción',
      maxWidth: { base: '220px', md: '300px' },
      render: (promo) => (
        <VStack align="start" gap="0.5" maxW={{ base: '220px', md: '300px' }} minW="0">
          <HStack gap="2" wrap="wrap">
            <Strong whiteSpace="normal" wordBreak="break-word">
              {promo.name}
            </Strong>
            {promo.code ? (
              <Badge colorPalette="brand" size="sm">
                {promo.code}
              </Badge>
            ) : null}
          </HStack>
          <Muted fontSize="xs" whiteSpace="normal" wordBreak="break-word">
            {promo.description || describePromotion(promo)}
          </Muted>
        </VStack>
      ),
    },
    {
      key: 'type',
      header: 'Beneficio',
      hideBelow: 'sm',
      maxWidth: { base: '160px', md: '200px' },
      render: (promo) => (
        <VStack align="start" gap="0.5" maxW={{ base: '160px', md: '200px' }} minW="0">
          <Strong fontSize="sm" whiteSpace="normal" wordBreak="break-word">
            {describePromotion(promo)}
          </Strong>
          <Muted fontSize="xs">
            {(promo.type && PROMOTION_TYPE_LABELS[promo.type]) ?? 'Promoción'}
          </Muted>
        </VStack>
      ),
    },
    {
      key: 'validity',
      header: 'Vigencia',
      hideBelow: 'md',
      render: (promo) => (
        <Muted fontSize="xs" whiteSpace="nowrap">
          {promo.startDate ? promo.startDate.slice(0, 10) : ''} al{' '}
          {promo.endDate ? promo.endDate.slice(0, 10) : ''}
        </Muted>
      ),
    },
    {
      key: 'uses',
      header: 'Usos',
      hideBelow: 'lg',
      render: (promo) => (
        <Muted fontSize="xs" whiteSpace="nowrap">
          {promo.usedCount}
          {promo.maxUsesTotal ? ` / ${promo.maxUsesTotal}` : ''}
        </Muted>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (promo) => <ActiveStatusText active={promo.active} feminine />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (promo) => (
        <RowEditToggleActions
          onEdit={() => navigate(promotionEditPath(promo.id))}
          checked={promo.active}
          onToggle={(checked) => toggle(promo.id, checked)}
          disabled={isMutating}
          ariaLabel={`Estado de ${promo.name}`}
          extra={
            <GhostButton size="sm" color="danger" onClick={() => setConfirmDelete(promo)}>
              Eliminar
            </GhostButton>
          }
        />
      ),
    },
  ]

  return (
    <CrudListPage
      title="Promociones"
      description="Administrá descuentos automáticos, promociones NxM y cupones de descuento."
      toolbar={
        <>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar promoción o cupón..."
          />
          <SelectField
            value={typeFilter}
            onChange={setTypeFilter}
            options={PROMOTION_TYPE_OPTIONS}
            placeholder="Tipo: Todos"
            width="filterControlSm"
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
        <PrimaryButton size="md" onClick={() => navigate(routes.promotionNew)}>
          Nueva promoción
        </PrimaryButton>
      }
      isLoading={isLoading}
      rows={filteredRows}
      columns={columns}
      getRowKey={(promo) => promo.id}
      emptyIcon={<Ticket width={40} height={40} />}
      emptyTitle="Sin promociones"
      emptyDescription="No hay promociones que coincidan con los filtros."
      modals={
        <ConfirmDeleteModal
          open={confirmDelete !== null}
          title="Eliminar promoción"
          description={`¿Eliminar la promoción "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
          isSubmitting={isMutating}
          onClose={() => setConfirmDelete(null)}
          onConfirm={async () => {
            if (confirmDelete) {
              try {
                await remove(confirmDelete.id)
                notifySuccess({ title: 'Promoción eliminada exitosamente' })
              } catch (error) {
                notifyError({
                  title: 'Error al eliminar la promoción',
                  description: getApiErrorMessage(error),
                })
              }
            }
            setConfirmDelete(null)
          }}
        />
      }
    />
  )
}
