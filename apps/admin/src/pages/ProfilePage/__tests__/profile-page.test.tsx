import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { ProfilePage } from '../index'

const auth = vi.hoisted(() => {
  const state: { user: Record<string, unknown> | null } = { user: null }
  const store = vi.fn((selector?: (snapshot: typeof state) => unknown) =>
    selector ? selector(state) : state,
  ) as unknown as {
    (selector?: (snapshot: typeof state) => unknown): unknown
    getState: () => typeof state
    setState: ReturnType<typeof vi.fn>
  }
  store.getState = () => state
  store.setState = vi.fn()
  return { state, store }
})

vi.mock('@repo/api', () => ({
  MOCK_SUPER_ADMIN: {
    id: 'super-admin-1',
    email: 'thomas.garcia@foodbosco.com',
    role: 'super_admin',
    firstName: 'Thomas',
    lastName: 'García',
    phone: '+54 11 5555 0000',
    active: true,
    createdAt: '2025-01-01T09:00:00',
  },
  useAuthStore: auth.store,
}))

describe('ProfilePage', () => {
  it('falls back to the mock super admin when there is no session user', () => {
    auth.state.user = null

    renderWithProviders(<ProfilePage />)

    expect(screen.getByText('Thomas García')).toBeInTheDocument()
    expect(screen.getByText('Administrador global')).toBeInTheDocument()
    expect(screen.getByText('thomas.garcia@foodbosco.com')).toBeInTheDocument()
  })

  it('renders the user from the auth store', () => {
    auth.state.user = {
      id: 'u1',
      email: 'ana@foodbosco.com',
      role: 'super_admin',
      firstName: 'Ana',
      lastName: 'Pérez',
      phone: '11 2222 3333',
      active: true,
      createdAt: '2025-02-02T09:00:00',
    }

    renderWithProviders(<ProfilePage />)

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('ana@foodbosco.com')).toBeInTheDocument()
    expect(screen.getByText('11 2222 3333')).toBeInTheDocument()
  })
})
