import { useMemo, useState } from 'react'
import { HStack, VStack } from '@chakra-ui/react'
import Persons from '@gravity-ui/icons/Persons'
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
import { useStaff } from '@repo/api'
import type { StaffMember } from '@repo/domain'
import { routes, staffEditPath } from '../../routes'

const ROLE_LABELS: Record<string, string> = {
  branch_admin: 'Colaborador',
  super_admin: 'Admin global',
}

const ROLE_OPTIONS = [
  { value: 'branch_admin', label: 'Colaboradores' },
  { value: 'super_admin', label: 'Admins globales' },
]

export const StaffPage = () => {
  const { staff, isLoading, isMutating, toggle } = useStaff()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return staff.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const matchesSearch = !query || fullName.includes(query) || member.email.toLowerCase().includes(query)
      const matchesRole = !role || member.role === role
      return matchesSearch && matchesRole
    })
  }, [staff, search, role])

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
      render: (member) => <Muted fontSize="sm">{member.active ? 'Activo' : 'Inactivo'}</Muted>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (member) => (
        <HStack gap="2" justify="end">
          <GhostButton size="sm" onClick={() => navigate(staffEditPath(member.id))}>
            Editar
          </GhostButton>
          <ToggleSwitch
            checked={member.active}
            onChange={(checked) => toggle(member.id, checked)}
            disabled={isMutating}
            ariaLabel={`Estado de ${member.firstName} ${member.lastName}`}
          />
        </HStack>
      ),
    },
  ]

  return (
    <WidePageContainer>
      <VStack align="start" gap="1">
        <PageTitle>Personal</PageTitle>
        <Muted>Creá colaboradores de sucursal y admins globales.</Muted>
      </VStack>

      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <FilterBar width="auto" flexGrow="1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o email..."
          />
          <SelectField
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS}
            placeholder="Rol: Todos"
            width="200px"
          />
        </FilterBar>
        <PrimaryButton size="md" onClick={() => navigate(routes.staffNew)}>
          Nuevo colaborador
        </PrimaryButton>
      </HStack>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<Persons width={40} height={40} />}
          title="Sin personal"
          description="No hay usuarios que coincidan con los filtros."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(member) => member.id}
          isLoading={isLoading}
          emptyTitle="Sin personal"
          emptyDescription="No hay personal para mostrar."
        />
      )}
    </WidePageContainer>
  )
}
