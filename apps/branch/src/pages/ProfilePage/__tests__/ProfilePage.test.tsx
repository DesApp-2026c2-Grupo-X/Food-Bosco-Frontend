import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { ProfilePage } from '../index'

interface AuthState {
  user: User | null
}

const authMock = vi.hoisted(() => {
  const state: AuthState = { user: null }

  const useAuthStore = ((selector?: (state: AuthState) => unknown) =>
    selector ? selector(state) : state) as {
    (selector?: (state: AuthState) => unknown): unknown
    getState: () => AuthState
    setState: (partial: Partial<AuthState>) => void
  }

  useAuthStore.getState = () => state
  useAuthStore.setState = (partial) => Object.assign(state, partial)

  return { state, useAuthStore }
})

vi.mock('@repo/api', () => ({
  useAuthStore: authMock.useAuthStore,
  MOCK_BRANCH_ADMIN: {
    id: 'mock-branch-admin',
    email: 'julian.sosa@foodbosco.com',
    role: 'branch_admin',
    firstName: 'Julián',
    lastName: 'Sosa',
    phone: '+54 11 5555 1234',
    active: true,
    createdAt: '2025-01-15T09:00:00',
    branchId: 'mock-branch-centro',
  },
}))

const user: User = {
  id: 'u1',
  email: 'carla@b.com',
  role: 'branch_admin',
  firstName: 'Carla',
  lastName: 'Gomez',
  phone: '+54 11 4000 5000',
  active: true,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    authMock.useAuthStore.setState({ user: null })
  })

  it('renders the signed-in user from the auth store', () => {
    authMock.useAuthStore.setState({ user })
    renderWithProviders(<ProfilePage />)

    expect(screen.getByText('Carla Gomez')).toBeInTheDocument()
    expect(screen.getByText('Administrador de sucursal')).toBeInTheDocument()
    expect(screen.getByText('carla@b.com')).toBeInTheDocument()
    expect(screen.getByText('+54 11 4000 5000')).toBeInTheDocument()
  })

  it('falls back to the mock branch admin when there is no session user', () => {
    renderWithProviders(<ProfilePage />)

    expect(screen.getByText('Julián Sosa')).toBeInTheDocument()
    expect(screen.getByText('julian.sosa@foodbosco.com')).toBeInTheDocument()
  })
})
