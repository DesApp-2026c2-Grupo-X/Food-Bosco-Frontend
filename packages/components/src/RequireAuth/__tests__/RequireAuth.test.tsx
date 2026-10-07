import { afterEach, describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen } from '@testing-library/react'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { RequireAuth } from '../index'

interface GuardProps {
  loginPath: string
  roles?: User['role'][]
  mockAuth?: boolean
}

const user: User = {
  id: 'u1',
  email: 'a@b.com',
  role: 'super_admin',
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '1',
  active: true,
  createdAt: '2025-01-01T00:00:00Z',
}

const renderGuarded = (props: GuardProps, route = '/') =>
  renderWithProviders(
    <Routes>
      <Route element={<RequireAuth {...props} />}>
        <Route path="/" element={<div>contenido privado</div>} />
      </Route>
      <Route path="/login" element={<div>página de login</div>} />
    </Routes>,
    { route },
  )

describe('RequireAuth', () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, bypassAuth: false })
  })

  it('muestra el contenido privado con usuario autenticado', () => {
    useAuthStore.setState({ user })

    renderGuarded({ loginPath: '/login' })

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('redirige al login cuando no hay usuario', () => {
    renderGuarded({ loginPath: '/login' })

    expect(screen.getByText('página de login')).toBeInTheDocument()
  })

  it('mockAuth permite el bypass de la autenticación', () => {
    renderGuarded({ loginPath: '/login', mockAuth: true })

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('?forceAuth=false anula el bypass de mockAuth', () => {
    renderGuarded({ loginPath: '/login', mockAuth: true }, '/?forceAuth=false')

    expect(screen.getByText('página de login')).toBeInTheDocument()
  })

  it('redirige cuando el usuario no tiene el rol requerido', () => {
    useAuthStore.setState({ user: { ...user, role: 'customer' } })

    renderGuarded({ loginPath: '/login', roles: ['super_admin'] })

    expect(screen.getByText('página de login')).toBeInTheDocument()
  })
})
