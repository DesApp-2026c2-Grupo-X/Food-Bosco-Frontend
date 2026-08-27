import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import MapPin from '@gravity-ui/icons/MapPin'
import { useNavigate } from 'react-router-dom'
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
import { useBranches } from '@repo/api'
import type { AdminBranch } from '@repo/domain'
import { branchEditPath, routes } from '../../routes'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
]

export const BranchesPage = () => {
  const { branches, isLoading, isMutating, toggle } = useBranches()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return branches.filter((branch) => {
      const matchesSearch =
        !query ||
        branch.name.toLowerCase().includes(query) ||
        branch.addressText.toLowerCase().includes(query)
      const matchesStatus = !status || (status === 'active' ? branch.active : !branch.active)
      return matchesSearch && matchesStatus
    })
  }, [branches, search, status])

  const columns: DataTableColumn<AdminBranch>[] = [
    { key: 'name', header: 'Nombre', render: (branch) => <Strong>{branch.name}</Strong> },
    {
      key: 'address',
      header: 'Dirección',
      hideBelow: 'sm',
      render: (branch) => <Muted fontSize="sm">{branch.addressText}</Muted>,
    },
    {
      key: 'phone',
      header: 'Teléfono',
      hideBelow: 'md',
      render: (branch) => <Muted fontSize="sm">{branch.phone}</Muted>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (branch) => <Muted fontSize="sm">{branch.active ? 'Activa' : 'Inactiva'}</Muted>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (branch) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => navigate(branchEditPath(branch.id))}>
            Editar
          </GhostButton>
          <ToggleSwitch
            checked={branch.active}
            onChange={(checked) => toggle(branch.id, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${branch.name}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Sucursales</PageTitle>
        <Muted>Administrá los locales físicos y sus horarios.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar sucursal..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Estado: Todas"
            width="180px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => navigate(routes.branchNew)}>
          Nueva sucursal
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<MapPin width={40} height={40} />}
          title="Sin sucursales"
          description="No hay sucursales que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(branch) => branch.id}
          isLoading={isLoading}
          emptyTitle="Sin sucursales"
          emptyDescription="No hay sucursales para mostrar."
        />
      )}
    </WidePageContainer>
  )
}
