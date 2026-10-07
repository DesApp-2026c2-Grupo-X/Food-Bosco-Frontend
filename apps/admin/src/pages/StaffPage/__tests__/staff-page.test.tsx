import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
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

const mockStaff = (overrides: Partial<ReturnType<typeof useStaff>> = {}) =>
  vi.mocked(useStaff).mockReturnValue({
    staff: [member],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useStaff>)

describe('StaffPage', () => {
  it('renders the staff rows with role and branch', () => {
    mockStaff()

    renderWithProviders(<StaffPage />)

    expect(screen.getByText('Julián Sosa')).toBeInTheDocument()
    expect(screen.getByText('Administrador de sucursal')).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('shows the empty state when there is no staff', () => {
    mockStaff({ staff: [] })

    renderWithProviders(<StaffPage />)

    expect(screen.getByText('Sin personal')).toBeInTheDocument()
  })

  it('navigates to the new collaborator page', async () => {
    mockStaff()

    renderWithProviders(
      <Routes>
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/staff/new" element={<div>Nuevo colaborador page</div>} />
      </Routes>,
      { route: '/staff' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo colaborador' }))

    expect(await screen.findByText('Nuevo colaborador page')).toBeInTheDocument()
  })

  it('toggles a collaborator status', async () => {
    const toggle = vi.fn()
    mockStaff({ toggle })

    renderWithProviders(<StaffPage />)

    await userEvent.click(screen.getByLabelText('Estado de Julián Sosa'))

    expect(toggle).toHaveBeenCalledWith('u1', false)
  })

  it('marks global admins as not editable', () => {
    mockStaff({ staff: [{ ...member, id: 'u2', role: 'super_admin', branchName: undefined }] })

    renderWithProviders(<StaffPage />)

    expect(screen.getByText('No editable')).toBeInTheDocument()
  })
})
