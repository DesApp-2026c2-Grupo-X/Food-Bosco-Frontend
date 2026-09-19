import MapPin from '@gravity-ui/icons/MapPin'
import { useNavigate } from 'react-router-dom'
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
import { useBranches } from '@repo/api'
import { ACTIVE_FILTER_OPTIONS_FEMININE, matchesActiveStatus, type AdminBranch } from '@repo/domain'
import { branchEditPath, routes } from '../../routes'

const searchKeys = [
  (branch: AdminBranch) => branch.name,
  (branch: AdminBranch) => branch.addressText,
]

const matchesStatus = (branch: AdminBranch, status: string) =>
  matchesActiveStatus(branch.active, status)

export const BranchesPage = () => {
  const { branches, isLoading, isMutating, toggle } = useBranches()
  const { rows, search, setSearch, status, setStatus } = useListFilters(branches, {
    searchKeys,
    matchesStatus,
  })
  const navigate = useNavigate()

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
      render: (branch) => <ActiveStatusText active={branch.active} feminine />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (branch) => (
        <RowEditToggleActions
          onEdit={() => navigate(branchEditPath(branch.id))}
          checked={branch.active}
          onToggle={(checked) => toggle(branch.id, checked)}
          disabled={isMutating}
          ariaLabel={`Estado de ${branch.name}`}
        />
      ),
    },
  ]

  return (
    <CrudListPage
      title="Sucursales"
      description="Administrá los locales físicos y sus horarios."
      toolbar={
        <>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar sucursal..."
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
        <PrimaryButton size="md" onClick={() => navigate(routes.branchNew)}>
          Nueva sucursal
        </PrimaryButton>
      }
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      getRowKey={(branch) => branch.id}
      emptyIcon={<MapPin width={40} height={40} />}
      emptyTitle="Sin sucursales"
      emptyDescription="No hay sucursales que coincidan con los filtros."
    />
  )
}
