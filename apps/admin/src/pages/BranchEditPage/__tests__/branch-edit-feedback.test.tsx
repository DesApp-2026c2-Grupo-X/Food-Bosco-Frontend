import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminBranch } from '@repo/domain'
import { useBranches } from '@repo/api'
import { toaster } from '@repo/components'
import { renderWithProviders } from '@test/utils'
import { BranchEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranches: vi.fn(),
  geocodeAddress: vi.fn(),
  buildLeafletTileUrl: vi.fn(() => ''),
}))

const branch: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: '11 5555 1111',
  active: true,
  hours: [],
}

const mockBranches = (overrides: Partial<ReturnType<typeof useBranches>> = {}) =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useBranches>)

const renderNew = () =>
  renderWithProviders(
    <Routes>
      <Route path="/branches/new" element={<BranchEditPage />} />
      <Route path="/branches/:branchId/edit" element={<div>Editar sucursal page</div>} />
    </Routes>,
    { route: '/branches/new' },
  )

const renderEdit = () =>
  renderWithProviders(
    <Routes>
      <Route path="/branches/:branchId/edit" element={<BranchEditPage />} />
    </Routes>,
    { route: '/branches/b1/edit' },
  )

const fillNewBranch = async () => {
  await userEvent.type(screen.getByLabelText('Nombre'), 'Centro')
  await userEvent.type(screen.getByLabelText('Dirección'), 'Casa')
  await userEvent.type(screen.getByLabelText('Latitud'), '-34.6')
  await userEvent.type(screen.getByLabelText('Longitud'), '-58.4')
}

const expectToast = (type: 'success' | 'error', title: string) =>
  expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({ type, title }))

describe('BranchEditPage feedback', () => {
  beforeEach(() => {
    vi.spyOn(toaster, 'create').mockImplementation(() => 'toast-id' as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('notifies success and navigates after creating a branch', async () => {
    const create = vi.fn().mockResolvedValue('b2')
    mockBranches({ create })
    renderNew()

    await fillNewBranch()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(create).toHaveBeenCalled())
    expectToast('success', 'Sucursal creada')
    expect(await screen.findByText('Editar sucursal page')).toBeInTheDocument()
  })

  it('notifies an error when creating a branch fails', async () => {
    const create = vi.fn().mockRejectedValue(new Error('boom'))
    mockBranches({ create })
    renderNew()

    await fillNewBranch()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(create).toHaveBeenCalled())
    expectToast('error', 'No pudimos guardar la sucursal')
  })

  it('submits active=false when the branch is deactivated', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockBranches({ branches: [branch], update })
    renderEdit()

    await screen.findByDisplayValue('Centro')
    await userEvent.click(screen.getByLabelText('Sucursal activa'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('b1', expect.objectContaining({ active: false })),
    )
    expectToast('success', 'Sucursal actualizada')
  })

  it('notifies an error when updating a branch fails', async () => {
    const update = vi.fn().mockRejectedValue(new Error('boom'))
    mockBranches({ branches: [branch], update })
    renderEdit()

    await screen.findByDisplayValue('Centro')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(update).toHaveBeenCalled())
    expectToast('error', 'No pudimos guardar la sucursal')
  })

  it('notifies success when the hours are saved', async () => {
    const saveHours = vi.fn().mockResolvedValue(undefined)
    mockBranches({ branches: [branch], saveHours })
    renderEdit()

    await screen.findByDisplayValue('Centro')
    await userEvent.click(screen.getByRole('tab', { name: 'Horarios' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar horarios' }))

    await waitFor(() => expect(saveHours).toHaveBeenCalledTimes(1))
    expectToast('success', 'Horarios actualizados')
  })

  it('notifies an error when saving the hours fails', async () => {
    const saveHours = vi.fn().mockRejectedValue(new Error('boom'))
    mockBranches({ branches: [branch], saveHours })
    renderEdit()

    await screen.findByDisplayValue('Centro')
    await userEvent.click(screen.getByRole('tab', { name: 'Horarios' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar horarios' }))

    await waitFor(() => expect(saveHours).toHaveBeenCalledTimes(1))
    expectToast('error', 'No pudimos guardar los horarios')
  })

  it('renders the map only when both coordinates are present', async () => {
    mockBranches()
    renderNew()

    expect(screen.queryByLabelText('Ubicación de la sucursal')).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Latitud'), '-34.6')
    await userEvent.type(screen.getByLabelText('Longitud'), '-58.4')

    expect(await screen.findByLabelText('Ubicación de la sucursal')).toBeInTheDocument()
  })
})
