import Persons from '@gravity-ui/icons/Persons'
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
import { useStaff } from '@repo/api'
import { ROLE_LABELS, ROLE_OPTIONS, type StaffMember } from '@repo/domain'
import { routes, staffEditPath } from '../../routes'

const searchKeys = [
  (member: StaffMember) => `${member.firstName} ${member.lastName}`,
  (member: StaffMember) => member.email,
]

const matchesRole = (member: StaffMember, role: string) => member.role === role

export const StaffPage = () => {
  const { staff, isLoading, isMutating, toggle } = useStaff()
  const { rows, search, setSearch, status, setStatus } = useListFilters(staff, {
    searchKeys,
    matchesStatus: matchesRole,
  })
  const navigate = useNavigate()

  const columns: DataTableColumn<StaffMember>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (member) => (
        <Strong>
          {member.firstName} {member.lastName}
        </Strong>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (member) => <Muted fontSize="sm">{ROLE_LABELS[member.role] ?? member.role}</Muted>,
    },
    {
      key: 'branch',
      header: 'Sucursal',
      hideBelow: 'sm',
      render: (member) => <Muted fontSize="sm">{member.branchName ?? '—'}</Muted>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (member) => <ActiveStatusText active={member.active} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (member) => (
        <RowEditToggleActions
          onEdit={() => navigate(staffEditPath(member.id))}
          checked={member.active}
          onToggle={(checked) => toggle(member.id, checked)}
          disabled={isMutating}
          ariaLabel={`Estado de ${member.firstName} ${member.lastName}`}
          readOnlyText={member.role === 'super_admin' ? 'No editable' : undefined}
        />
      ),
    },
  ]

  return (
    <CrudListPage
      title="Personal"
      description="Creá colaboradores de sucursal y admins globales."
      toolbar={
        <>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o email..."
          />
          <SelectField
            value={status}
            onChange={setStatus}
            options={ROLE_OPTIONS}
            placeholder="Rol: Todos"
            width="filterControl"
          />
        </>
      }
      action={
        <PrimaryButton size="md" onClick={() => navigate(routes.staffNew)}>
          Nuevo colaborador
        </PrimaryButton>
      }
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      getRowKey={(member) => member.id}
      emptyIcon={<Persons width={40} height={40} />}
      emptyTitle="Sin personal"
      emptyDescription="No hay usuarios que coincidan con los filtros."
    />
  )
}
