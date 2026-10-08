import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { AuthProvider, type AuthAppConfig } from '../../../index'
import { RegisterPage } from '../index'

const renderRegister = (config: AuthAppConfig = {}) => {
  useAuthStore.setState({ register: vi.fn(), registerRider: vi.fn() })

  return renderWithProviders(
    <AuthProvider {...config}>
      <RegisterPage />
    </AuthProvider>,
    { route: '/register' },
  )
}

describe('RegisterPage', () => {
  it('shows the role switch when more than one role is configured', () => {
    renderRegister({ registerRoles: ['customer', 'rider'] })

    expect(screen.getByRole('button', { name: 'Cliente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Repartidor' })).toBeInTheDocument()
  })

  it('hides the role switch when a single role is configured', () => {
    renderRegister({ registerRoles: ['customer'] })

    expect(screen.queryByRole('button', { name: 'Cliente' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Repartidor' })).not.toBeInTheDocument()
  })

  it('reveals the vehicle switch after switching to the rider role', async () => {
    renderRegister({ registerRoles: ['customer', 'rider'] })

    expect(screen.queryByRole('button', { name: 'Moto' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Repartidor' }))

    expect(screen.getByRole('button', { name: 'Moto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bici' })).toBeInTheDocument()
  })

  it('shows moto fields and swaps them for the bici info box', async () => {
    renderRegister({ registerDefaultRole: 'rider', registerRoles: ['rider'] })

    expect(screen.getByPlaceholderText('Honda')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('CG 125')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('AB 123 CD')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Bici' }))

    expect(screen.queryByPlaceholderText('Honda')).not.toBeInTheDocument()
    expect(screen.getByText('No requiere marca, modelo ni patente.')).toBeInTheDocument()
  })

  it('links to the rider app when rider is not registerable', () => {
    renderRegister({ registerRoles: ['customer'], riderUrl: 'http://localhost:5176/' })

    expect(screen.getByRole('link', { name: 'Registrate en la app de Rider' })).toHaveAttribute(
      'href',
      'http://localhost:5176/register',
    )
  })

  it('hides the rider app link when rider is registerable', () => {
    renderRegister({ registerRoles: ['customer', 'rider'], riderUrl: 'http://localhost:5176' })

    expect(
      screen.queryByRole('link', { name: 'Registrate en la app de Rider' }),
    ).not.toBeInTheDocument()
  })
})
