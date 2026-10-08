import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import type { User } from '@repo/domain'
import { ProfileScreen, type ProfileNavItem } from '@repo/components'
import { ProfilePage } from '../index'
import { renderWithProviders } from '@test/utils'

const auth = vi.hoisted(() => ({ logout: vi.fn() }))
vi.mock('@repo/auth', () => ({ useLogout: () => auth.logout }))

const user: User = {
  id: 'u1',
  email: 'ana@bosco.com',
  role: 'customer',
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '+54 11 5555-1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user, accessToken: null })
  })

  it('links every account option to its route', async () => {
    renderWithProviders(<ProfilePage />, { route: '/profile' })

    expect(await screen.findByRole('link', { name: 'Editar perfil' })).toHaveAttribute(
      'href',
      '/profile/edit',
    )
    expect(screen.getByRole('link', { name: 'Mis direcciones' })).toHaveAttribute(
      'href',
      '/profile/addresses',
    )
    expect(screen.getByRole('link', { name: 'Sucursales' })).toHaveAttribute('href', '/branches')
  })

  it('offers the appearance toggle', () => {
    renderWithProviders(<ProfilePage />, { route: '/profile' })

    expect(screen.getByText('Apariencia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeInTheDocument()
  })

  it('shows a placeholder identity when there is no user', () => {
    useAuthStore.setState({ user: null, accessToken: null })

    renderWithProviders(<ProfilePage />, { route: '/profile' })

    expect(screen.getByText('Sin nombre')).toBeInTheDocument()
  })

  it('logs out when the button is pressed', async () => {
    renderWithProviders(<ProfilePage />, { route: '/profile' })

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(auth.logout).toHaveBeenCalledTimes(1)
  })

  it('renders the fallback icon for navigation items without icon', () => {
    const items = [{ id: 'x', label: 'Opciones', path: '/x' }] as unknown as ProfileNavItem[]

    renderWithProviders(
      <ProfileScreen
        title="Mi perfil"
        description="Tus datos."
        identity={<span>identidad</span>}
        navItems={items}
        navFallbackIcon={<span data-testid="fallback-icon" />}
        onLogout={vi.fn()}
      />,
      { route: '/profile' },
    )

    expect(screen.getByTestId('fallback-icon')).toBeInTheDocument()
  })
})
