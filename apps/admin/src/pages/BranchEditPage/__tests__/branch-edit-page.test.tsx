import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch } from '@repo/domain'
import { geocodeAddress, useBranches } from '@repo/api'
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

describe('BranchEditPage', () => {
  it('shows a required error when a field is cleared', async () => {
    const create = vi.fn()
    mockBranches({ create })

    renderNew()

    const name = screen.getByLabelText('Nombre')
    await userEvent.type(name, 'x')
    await userEvent.clear(name)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
  })

  it('does not submit while required fields are empty', async () => {
    const create = vi.fn()
    mockBranches({ create })

    renderNew()

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(create).not.toHaveBeenCalled()
  })

  it('creates a branch and navigates to its edit page', async () => {
    const create = vi.fn().mockResolvedValue('b2')
    mockBranches({ create })

    renderNew()

    await userEvent.type(screen.getByLabelText('Nombre'), 'Centro')
    await userEvent.type(screen.getByLabelText('Dirección'), 'Casa')
    await userEvent.type(screen.getByLabelText('Latitud'), '-34.6')
    await userEvent.type(screen.getByLabelText('Longitud'), '-58.4')
    await userEvent.type(screen.getByLabelText('Teléfono'), '11 5555 1111')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        name: 'Centro',
        addressText: 'Casa',
        latitude: -34.6,
        longitude: -58.4,
        phone: '11 5555 1111',
        active: true,
      }),
    )
    expect(await screen.findByText('Editar sucursal page')).toBeInTheDocument()
  })

  it('validates the coordinate ranges', async () => {
    const create = vi.fn()
    mockBranches({ create })

    renderNew()

    await userEvent.type(screen.getByLabelText('Nombre'), 'Centro')
    await userEvent.type(screen.getByLabelText('Dirección'), 'Casa')
    await userEvent.type(screen.getByLabelText('Latitud'), '999')
    await userEvent.type(screen.getByLabelText('Longitud'), '-58.4')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Latitud fuera de rango')).toBeInTheDocument()
    expect(create).not.toHaveBeenCalled()
  })

  it('loads the branch data and updates it', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockBranches({ branches: [branch], update })

    renderEdit()

    expect(screen.getByDisplayValue('Centro')).toBeInTheDocument()

    const name = screen.getByLabelText('Nombre')
    await userEvent.clear(name)
    await userEvent.type(name, 'Norte')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('b1', expect.objectContaining({ name: 'Norte' })),
    )
  })

  it('saves the schedule from the hours tab', async () => {
    const saveHours = vi.fn().mockResolvedValue(undefined)
    mockBranches({ branches: [branch], saveHours })

    renderEdit()

    await userEvent.click(screen.getByRole('tab', { name: 'Horarios' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar horarios' }))

    await waitFor(() => expect(saveHours).toHaveBeenCalledTimes(1))
    const [id, hours] = saveHours.mock.calls[0] as [string, unknown[]]
    expect(id).toBe('b1')
    expect(hours).toHaveLength(7)
  })

  it('shows the not found state when the branch does not exist', () => {
    mockBranches({ branches: [] })

    renderEdit()

    expect(screen.getByText('Sucursal no encontrada')).toBeInTheDocument()
  })

  it('shows the loading state while the branch is loading', () => {
    mockBranches({ branches: [], isLoading: true })

    renderEdit()

    expect(screen.getByText('Sucursal')).toBeInTheDocument()
  })

  it('trims the address before geocoding it', async () => {
    const geocode = vi.mocked(geocodeAddress).mockResolvedValue({ lat: -34.5, lon: -58.5 })
    mockBranches()

    renderNew()

    await userEvent.type(screen.getByLabelText('Dirección'), 'Av. Vergara 1200, Hurlingham')
    await userEvent.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))

    await waitFor(() => expect(geocode).toHaveBeenCalledWith('Av. Vergara 1200, Hurlingham'))
  })
})
