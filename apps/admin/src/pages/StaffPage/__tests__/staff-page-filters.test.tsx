import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { StaffMember } from '@repo/domain'
import { useStaff } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StaffPage } from '../index'

vi.mock('@repo/api', () => ({ useStaff: vi.fn() }))

const member: StaffMember = {
  id: 'u1',
  firstName: 'Julián',
  lastName: 'Sosa',
  email: 'julian@foodbosco.com',
  phone: '11 5555 1234',
  role: 'branch_admin',
  active: true,
  branchId: 'b1',
  branchName: 'Centro',
}

const admin: StaffMember = {
  id: 'u2',
  firstName: 'Ana',
  lastName: 'Gómez',
  email: 'ana@foodbosco.com',
  phone: '11 6666 2222',
  role: 'super_admin',
  active: true,
  branchId: null,
  branchName: undefined,
}

const orphan: StaffMember = {
  id: 'u3',
  firstName: 'Carla',
  lastName: 'Díaz',
  email: 'carla@foodbosco.com',
  phone: '11 7777 3333',
  role: 'branch_admin',
  active: true,
  branchId: 'b9',
  branchName: undefined,
}

const mockStaff = (overrides: Partial<ReturnType<typeof useStaff>> = {}) =>
  vi.mocked(useStaff).mockReturnValue({
    staff: [member, admin, orphan],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useStaff>)

const EditProbe = () => {
  const { userId } = useParams()
  return <div>Editando {userId}</div>
}

describe('StaffPage filters', () => {
  it('filters by collaborator name', async () => {
    mockStaff()

    renderWithProviders(<StaffPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre o email...'), 'Ana')

    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Julián Sosa')).not.toBeInTheDocument()
  })

  it('filters by collaborator email', async () => {
    mockStaff()

    renderWithProviders(<StaffPage />)

    await userEvent.type(
      screen.getByPlaceholderText('Buscar por nombre o email...'),
      'julian@foodbosco.com',
    )

    expect(screen.getByText('Julián Sosa')).toBeInTheDocument()
    expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument()
  })

  it('filters by role including global admins', async () => {
    mockStaff()

    renderWithProviders(<StaffPage />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'super_admin')

    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Julián Sosa')).not.toBeInTheDocument()
    expect(screen.queryByText('Carla Díaz')).not.toBeInTheDocument()
  })

  it('falls back to a dash when a collaborator has no branch name', () => {
    mockStaff({ staff: [orphan] })

    renderWithProviders(<StaffPage />)

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('Carla Díaz')).toBeInTheDocument()
  })

  it('shows the loading skeleton instead of rows', () => {
    mockStaff({ isLoading: true })

    renderWithProviders(<StaffPage />)

    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.queryByText('Julián Sosa')).not.toBeInTheDocument()
  })

  it('navigates to the edit page of the selected collaborator', async () => {
    mockStaff()

    renderWithProviders(
      <Routes>
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff/:userId/edit" element={<EditProbe />} />
      </Routes>,
      { route: '/staff' },
    )

    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0])

    expect(await screen.findByText('Editando u1')).toBeInTheDocument()
  })
})
