import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, StaffMember } from '@repo/domain'
import { useBranches, useStaff } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { StaffEditPage } from '../index'

vi.mock('@repo/api', () => ({ useStaff: vi.fn(), useBranches: vi.fn() }))

const branch = (id: string, name: string): AdminBranch => ({
  id,
  name,
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
})

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
    branches: [branch('b1', 'Centro'), branch('b2', 'Norte')],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

const renderEdit = (userId = 'u1') =>
  renderWithProviders(
    <Routes>
      <Route path="/staff/:userId/edit" element={<StaffEditPage />} />
      <Route path="/staff" element={<div>Listado de personal</div>} />
    </Routes>,
    { route: `/staff/${userId}/edit` },
  )

describe('StaffEditPage roles and validation', () => {
  it('disables the email and role fields while editing', () => {
    mockStaff()
    mockBranches()

    renderEdit()

    expect(screen.getByLabelText('Correo electrónico')).toBeDisabled()
    expect(screen.getByLabelText('Rol')).toBeDisabled()
  })

  it('updates the payload with the changed branch and without email or role', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockStaff({ update })
    mockBranches()

    renderEdit()

    await userEvent.selectOptions(screen.getByLabelText('Sucursal'), 'b2')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('u1', {
        firstName: 'Julián',
        lastName: 'Sosa',
        phone: '11 5555 1234',
        branchId: 'b2',
      }),
    )
    expect(Object.keys(update.mock.calls[0][1])).toEqual([
      'firstName',
      'lastName',
      'phone',
      'branchId',
    ])
  })

  it('shows a phone validation error and blocks the update', async () => {
    const update = vi.fn()
    mockStaff({ update })
    mockBranches()

    renderEdit()

    const phone = screen.getByLabelText('Teléfono')
    await userEvent.clear(phone)
    await userEvent.type(phone, 'abc')
    await userEvent.tab()

    expect(await screen.findByText('Ingresá un teléfono válido')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(update).not.toHaveBeenCalled()
  })

  it('validates the email when creating a collaborator', async () => {
    mockStaff()
    mockBranches()

    renderWithProviders(
      <Routes>
        <Route path="/staff/new" element={<StaffEditPage />} />
      </Routes>,
      { route: '/staff/new' },
    )

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'correo-invalido')
    await userEvent.tab()

    expect(await screen.findByText('Ingresá un email válido')).toBeInTheDocument()
  })

  it('shows the loading shell while the member is being fetched', () => {
    mockStaff({ staff: [], isLoading: true })
    mockBranches()

    renderEdit()

    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
  })

  it('navigates back to the staff list on cancel', async () => {
    mockStaff()
    mockBranches()

    renderEdit()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(await screen.findByText('Listado de personal')).toBeInTheDocument()
  })
})
