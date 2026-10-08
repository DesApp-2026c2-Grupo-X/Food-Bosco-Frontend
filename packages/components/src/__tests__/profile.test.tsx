import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { User } from '@repo/domain'
import { ProfileNav } from '../ProfileNav'
import type { ProfileNavItem } from '../ProfileNav/types'
import { ProfileIdentity } from '../ProfileIdentity'
import { ProfileScreen } from '../ProfileScreen'
import { ProfileView } from '../ProfileView'
import { ProfileIconLink } from '../ProfileIconLink'
import { renderWithProviders } from '@test/utils'

describe('ProfileNav', () => {
  const items: ProfileNavItem[] = [
    { id: 'edit', label: 'Editar perfil', path: '/profile/edit', icon: <span>E</span> },
    {
      id: 'addresses',
      label: 'Direcciones',
      path: '/profile/addresses',
      icon: <span>A</span>,
      disabled: true,
      hint: 'Próximamente',
    },
    {
      id: 'claims',
      label: 'Reclamos',
      path: '/profile/claims',
      icon: <span>R</span>,
      hint: 'No debería verse',
    },
  ]

  it('links enabled items and disables the rest', () => {
    renderWithProviders(<ProfileNav items={items} />)

    expect(screen.getByRole('link', { name: /Editar perfil/ })).toHaveAttribute(
      'href',
      '/profile/edit',
    )
    expect(screen.getByRole('link', { name: /Reclamos/ })).toHaveAttribute(
      'href',
      '/profile/claims',
    )
    expect(screen.queryByRole('link', { name: /Direcciones/ })).not.toBeInTheDocument()
    expect(screen.getByText('Direcciones').closest('[aria-disabled]')).not.toBeNull()
  })

  it('shows the hint only for disabled items', () => {
    renderWithProviders(<ProfileNav items={items} />)

    expect(screen.getByText('Próximamente')).toBeInTheDocument()
    expect(screen.queryByText('No debería verse')).not.toBeInTheDocument()
  })
})

describe('ProfileIdentity', () => {
  it('renders the trimmed name, email and subtitle', () => {
    renderWithProviders(
      <ProfileIdentity
        firstName=" Ana "
        lastName="Perez"
        email="ana@test.com"
        subtitle="Cliente"
      />,
    )

    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
  })

  it('falls back to Sin nombre when there is no name', () => {
    renderWithProviders(<ProfileIdentity email="anon@test.com" />)

    expect(screen.getByText('Sin nombre')).toBeInTheDocument()
  })
})

describe('ProfileScreen', () => {
  it('renders the appearance card and calls onLogout', async () => {
    const onLogout = vi.fn()

    renderWithProviders(
      <ProfileScreen
        title="Mi perfil"
        description="Gestioná tu cuenta"
        identity={<div>Identidad</div>}
        appearance
        navItems={[]}
        onLogout={onLogout}
      />,
    )

    expect(screen.getByText('Mi perfil')).toBeInTheDocument()
    expect(screen.getByText('Gestioná tu cuenta')).toBeInTheDocument()
    expect(screen.getByText('Identidad')).toBeInTheDocument()
    expect(screen.getByText('Apariencia')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }))

    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it('hides the appearance card when disabled', () => {
    renderWithProviders(
      <ProfileScreen
        title="Mi perfil"
        description="Gestioná tu cuenta"
        identity={<div>Identidad</div>}
        appearance={false}
        navItems={[]}
        onLogout={vi.fn()}
      />,
    )

    expect(screen.queryByText('Apariencia')).not.toBeInTheDocument()
  })
})

describe('ProfileView', () => {
  const user: User = {
    id: 'u1',
    email: 'juan@test.com',
    role: 'rider',
    firstName: 'Juan',
    lastName: 'Perez',
    phone: '1144556677',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  }

  it('shows the role label and contact details', () => {
    renderWithProviders(<ProfileView user={user} description="Tus datos" />)

    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByText('Repartidor')).toBeInTheDocument()
    expect(screen.getByText('juan@test.com')).toBeInTheDocument()
    expect(screen.getByText('1144556677')).toBeInTheDocument()
  })
})

describe('ProfileIconLink', () => {
  it('renders an accessible link to the profile', () => {
    renderWithProviders(<ProfileIconLink to="/profile" />)

    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/profile')
  })
})
