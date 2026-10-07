import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch } from '@repo/domain'
import { useBranches } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { BranchesPage } from '../index'

vi.mock('@repo/api', () => ({ useBranches: vi.fn() }))

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
    branches: [branch],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useBranches>)

describe('BranchesPage', () => {
  it('renders the branch rows with their status', () => {
    mockBranches()

    renderWithProviders(<BranchesPage />)

    expect(screen.getByText('Centro')).toBeInTheDocument()
    expect(screen.getByText('Av. Vergara 1200')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('shows the empty state when there are no branches', () => {
    mockBranches({ branches: [] })

    renderWithProviders(<BranchesPage />)

    expect(screen.getByText('Sin sucursales')).toBeInTheDocument()
  })

  it('navigates to the new branch page', async () => {
    mockBranches()

    renderWithProviders(
      <Routes>
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/new" element={<div>Nueva sucursal page</div>} />
      </Routes>,
      { route: '/branches' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Nueva sucursal' }))

    expect(await screen.findByText('Nueva sucursal page')).toBeInTheDocument()
  })

  it('navigates to the edit page of a row', async () => {
    mockBranches()

    renderWithProviders(
      <Routes>
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:branchId/edit" element={<div>Editar sucursal page</div>} />
      </Routes>,
      { route: '/branches' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    expect(await screen.findByText('Editar sucursal page')).toBeInTheDocument()
  })

  it('toggles the active status of a branch', async () => {
    const toggle = vi.fn()
    mockBranches({ toggle })

    renderWithProviders(<BranchesPage />)

    await userEvent.click(screen.getByLabelText('Estado de Centro'))

    expect(toggle).toHaveBeenCalledWith('b1', false)
  })
})
