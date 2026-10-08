import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch } from '@repo/domain'
import { useBranches } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { BranchesPage } from '../index'

vi.mock('@repo/api', () => ({ useBranches: vi.fn() }))

const centro: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

const norte: AdminBranch = {
  id: 'b2',
  name: 'Norte',
  addressText: 'Calle Falsa 123',
  latitude: -34.5,
  longitude: -58.5,
  phone: null,
  active: false,
  hours: [],
}

const mockBranches = (overrides: Partial<ReturnType<typeof useBranches>> = {}) =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [centro, norte],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useBranches>)

describe('BranchesPage filters', () => {
  it('searches by address text', async () => {
    mockBranches()
    renderWithProviders(<BranchesPage />)

    await userEvent.type(screen.getByPlaceholderText('Buscar sucursal...'), 'Vergara')

    expect(screen.getByText('Centro')).toBeInTheDocument()
    expect(screen.queryByText('Norte')).not.toBeInTheDocument()
  })

  it('filters by status', async () => {
    mockBranches()
    renderWithProviders(<BranchesPage />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'inactive')

    expect(screen.getByText('Norte')).toBeInTheDocument()
    expect(screen.queryByText('Centro')).not.toBeInTheDocument()
  })

  it('disables the toggles while mutating', () => {
    mockBranches({ isMutating: true })
    renderWithProviders(<BranchesPage />)

    const toggle = screen.getByLabelText('Estado de Centro') as HTMLLabelElement
    expect(toggle.control).toBeDisabled()
  })

  it('shows the loading state', () => {
    mockBranches({ isLoading: true })
    const { container } = renderWithProviders(<BranchesPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText('Centro')).not.toBeInTheDocument()
  })
})
