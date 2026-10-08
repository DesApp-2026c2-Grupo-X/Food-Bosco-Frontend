import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { AuthProvider, type AuthAppConfig } from '../../../index'
import { LoginPage } from '../index'

const EMAIL_PLACEHOLDER = 'juan.perez@unahur.edu.ar'
const PASSWORD_PLACEHOLDER = 'Tu contraseña'

const HomeProbe = () => <span data-testid="home">home</span>

const renderLogin = (config: AuthAppConfig = {}, login = vi.fn()) => {
  useAuthStore.setState({ login, user: { role: 'customer' } as never })

  return renderWithProviders(
    <AuthProvider {...config}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomeProbe />} />
      </Routes>
    </AuthProvider>,
    { route: '/login' },
  )
}

const fillValidCredentials = async () => {
  await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'ana@example.com')
  await userEvent.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), 'secret')
}

describe('LoginPage', () => {
  it('keeps submit disabled until the credentials are valid', async () => {
    renderLogin()
    const button = screen.getByRole('button', { name: 'Ingresar' })

    expect(button).toBeDisabled()

    await fillValidCredentials()

    await waitFor(() => expect(button).toBeEnabled())
  })

  it('shows the friendly error when the store rejects', async () => {
    renderLogin({}, vi.fn().mockRejectedValue(new Error('401')))

    await fillValidCredentials()
    const button = screen.getByRole('button', { name: 'Ingresar' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(
      await screen.findByText('No pudimos iniciar sesión. Revisá tus datos.'),
    ).toBeInTheDocument()
  })

  it('links to password recovery and registration by default', () => {
    renderLogin()

    expect(screen.getByRole('link', { name: 'Olvidé mi contraseña' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register')
  })

  it('hides the registration link when showRegister is false', () => {
    renderLogin({ showRegister: false })

    expect(screen.getByRole('link', { name: 'Olvidé mi contraseña' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()
  })

  it('redirects to the default path after a successful login', async () => {
    renderLogin({ defaultPath: '/home' })

    await fillValidCredentials()
    const button = screen.getByRole('button', { name: 'Ingresar' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(await screen.findByTestId('home')).toBeInTheDocument()
  })
})
