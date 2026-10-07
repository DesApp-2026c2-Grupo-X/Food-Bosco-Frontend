import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, StaffMember } from '@repo/domain'
import { useBranches, useStaff } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StaffEditPage } from '../index'

vi.mock('@repo/api', () => ({ useStaff: vi.fn(), useBranches: vi.fn() }))

const branch: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

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

const mockBranches = () =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [branch],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

const renderNew = () =>
  renderWithProviders(
    <Routes>
      <Route path="/staff/new" element={<StaffEditPage />} />
    </Routes>,
    { route: '/staff/new' },
  )

const renderEdit = (userId = 'u1') =>
  renderWithProviders(
    <Routes>
      <Route path="/staff/:userId/edit" element={<StaffEditPage />} />
    </Routes>,
    { route: `/staff/${userId}/edit` },
  )

describe('StaffEditPage', () => {
  it('shows a required error when a field is cleared', async () => {
    const create = vi.fn()
    mockStaff({ create })
    mockBranches()

    renderNew()

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.type(firstName, 'x')
    await userEvent.clear(firstName)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })

  it('creates a branch admin with its branch', async () => {
    const create = vi.fn().mockResolvedValue(undefined)
    mockStaff({ create })
    mockBranches()

    renderNew()

    await userEvent.type(screen.getByLabelText('Nombre'), 'María')
    await userEvent.type(screen.getByLabelText('Apellido'), 'López')
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'maria@foodbosco.com')
    await userEvent.type(screen.getByLabelText('Teléfono'), '11 4444 2222')
    await userEvent.type(screen.getByLabelText('Contraseña inicial'), 'secreto123')
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'branch_admin')
    await userEvent.selectOptions(await screen.findByLabelText('Sucursal'), 'b1')
    await userEvent.click(screen.getByRole('button', { name: 'Crear colaborador' }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        firstName: 'María',
        lastName: 'López',
        email: 'maria@foodbosco.com',
        phone: '11 4444 2222',
        password: 'secreto123',
        role: 'branch_admin',
        branchId: 'b1',
      }),
    )
  })

  it('only asks for a branch when the role is a branch admin', async () => {
    mockStaff()
    mockBranches()

    renderNew()

    expect(screen.queryByLabelText('Sucursal')).not.toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'branch_admin')
    expect(await screen.findByLabelText('Sucursal')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'super_admin')
    expect(screen.queryByLabelText('Sucursal')).not.toBeInTheDocument()
  })

  it('loads a member and updates it', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockStaff({ update })
    mockBranches()

    renderEdit()

    expect(screen.getByDisplayValue('Julián')).toBeInTheDocument()

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.clear(firstName)
    await userEvent.type(firstName, 'Julia')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('u1', {
        firstName: 'Julia',
        lastName: 'Sosa',
        phone: '11 5555 1234',
        branchId: 'b1',
      }),
    )
  })

  it('blocks editing a global admin', () => {
    mockStaff({ staff: [{ ...member, role: 'super_admin' }] })
    mockBranches()

    renderEdit()

    expect(screen.getByText('Admin global no editable')).toBeInTheDocument()
  })

  it('shows the not found state for unknown members', () => {
    mockStaff({ staff: [] })
    mockBranches()

    renderEdit('missing')

    expect(screen.getByText('Usuario no encontrado')).toBeInTheDocument()
  })
})
