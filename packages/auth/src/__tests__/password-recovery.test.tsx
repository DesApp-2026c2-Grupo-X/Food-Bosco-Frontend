import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'

const testClient = () => createTestClient(() => ({ data: {} })).client

const EMAIL_PLACEHOLDER = 'juan.perez@unahur.edu.ar'
const PASSWORD_PLACEHOLDER = 'Mínimo 8 caracteres'
const CONFIRM_PLACEHOLDER = 'Repetí tu contraseña'
const NEUTRAL_MESSAGE = /Si existe una cuenta asociada a ese email/

const renderForgot = () =>
  renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password', client: testClient() })

const renderReset = (route = '/reset-password?token=tok-123') =>
  renderWithProviders(<ResetPasswordPage />, { route, client: testClient() })

const fillValidResetForm = async () => {
  await userEvent.type(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), '12345678')
  await userEvent.type(screen.getByPlaceholderText(CONFIRM_PLACEHOLDER), '12345678')
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ forgotPassword: vi.fn(), resetPassword: vi.fn() })
})

describe('ForgotPasswordPage', () => {
  it('renders the recovery form', () => {
    renderForgot()

    expect(screen.getByText('Recuperá tu contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(EMAIL_PLACEHOLDER)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar instrucciones' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al login' })).toHaveAttribute('href', '/login')
  })

  it('requires a valid email', async () => {
    renderForgot()
    const email = screen.getByPlaceholderText(EMAIL_PLACEHOLDER)

    await userEvent.click(email)
    await userEvent.tab()
    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()

    await userEvent.type(email, 'not-an-email')
    await userEvent.tab()
    expect(await screen.findByText('Ingresá un email válido')).toBeInTheDocument()
  })

  it('requests recovery and shows a neutral message', async () => {
    const forgotPassword = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ forgotPassword })
    renderForgot()

    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), '  ana@example.com  ')
    const button = screen.getByRole('button', { name: 'Enviar instrucciones' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(forgotPassword).toHaveBeenCalledWith('ana@example.com')
    expect(await screen.findByText(NEUTRAL_MESSAGE)).toBeInTheDocument()
  })

  it('shows a loading state and blocks duplicate submissions', async () => {
    let resolveRequest: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })
    const forgotPassword = vi.fn().mockReturnValue(pending)
    useAuthStore.setState({ forgotPassword })
    renderForgot()

    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'ana@example.com')
    const button = screen.getByRole('button', { name: 'Enviar instrucciones' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(screen.getByText('Enviando...').closest('button')).toBeDisabled()
    expect(forgotPassword).toHaveBeenCalledTimes(1)

    resolveRequest()
    expect(await screen.findByText(NEUTRAL_MESSAGE)).toBeInTheDocument()
  })

  it('maps throttling errors to a friendly message', async () => {
    useAuthStore.setState({
      forgotPassword: vi.fn().mockRejectedValue({
        graphQLErrors: [{ message: 'ThrottlerException: Too Many Requests' }],
      }),
    })
    renderForgot()

    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'ana@example.com')
    const button = screen.getByRole('button', { name: 'Enviar instrucciones' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(await screen.findByText(/demasiados intentos/)).toBeInTheDocument()
    expect(screen.queryByText(NEUTRAL_MESSAGE)).not.toBeInTheDocument()
  })

  it('maps unexpected errors to the generic message', async () => {
    useAuthStore.setState({ forgotPassword: vi.fn().mockRejectedValue(new Error('boom')) })
    renderForgot()

    await userEvent.type(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), 'ana@example.com')
    const button = screen.getByRole('button', { name: 'Enviar instrucciones' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(
      await screen.findByText('No pudimos enviar las instrucciones. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })
})

describe('ResetPasswordPage', () => {
  it('renders the form when a token is present', () => {
    renderReset()

    expect(screen.getByText('Restablecé tu contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(CONFIRM_PLACEHOLDER)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar contraseña' })).toBeInTheDocument()
  })

  it('shows an invalid link state when the token is missing', () => {
    renderReset('/reset-password')

    expect(screen.getByText('Enlace no válido')).toBeInTheDocument()
    expect(screen.getByText('El enlace de recuperación no es válido.')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(PASSWORD_PLACEHOLDER)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar nuevo enlace' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
    expect(screen.getByRole('link', { name: 'Volver al login' })).toHaveAttribute('href', '/login')
  })

  it('validates required and matching passwords', async () => {
    renderReset()
    const password = screen.getByPlaceholderText(PASSWORD_PLACEHOLDER)
    const confirm = screen.getByPlaceholderText(CONFIRM_PLACEHOLDER)

    await userEvent.click(password)
    await userEvent.tab()
    expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument()

    await userEvent.type(password, '12345678')
    await userEvent.click(confirm)
    await userEvent.tab()
    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()

    await userEvent.type(confirm, '12345679')
    await userEvent.tab()
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('sends the token and the new password, then confirms success', async () => {
    const resetPassword = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ resetPassword })
    renderReset('/reset-password?token=tok-abc')

    await fillValidResetForm()
    const button = screen.getByRole('button', { name: 'Cambiar contraseña' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(resetPassword).toHaveBeenCalledWith('tok-abc', '12345678')
    expect(await screen.findByText('Contraseña actualizada correctamente')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
  })

  it('shows a loading state while resetting', async () => {
    let resolveRequest: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })
    const resetPassword = vi.fn().mockReturnValue(pending)
    useAuthStore.setState({ resetPassword })
    renderReset()

    await fillValidResetForm()
    const button = screen.getByRole('button', { name: 'Cambiar contraseña' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(screen.getByText('Actualizando contraseña...').closest('button')).toBeDisabled()
    expect(resetPassword).toHaveBeenCalledTimes(1)

    resolveRequest()
    expect(await screen.findByText('Contraseña actualizada correctamente')).toBeInTheDocument()
  })

  it('shows an expired/invalid token state when the backend rejects the token', async () => {
    useAuthStore.setState({
      resetPassword: vi.fn().mockRejectedValue({
        graphQLErrors: [{ message: 'El token de recuperación es inválido o expiró' }],
      }),
    })
    renderReset()

    await fillValidResetForm()
    const button = screen.getByRole('button', { name: 'Cambiar contraseña' })
    await waitFor(() => expect(button).toBeEnabled())
    await userEvent.click(button)

    expect(await screen.findByText('Enlace no válido')).toBeInTheDocument()
    expect(screen.getByText(/no es válido o ya expiró/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar nuevo enlace' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
  })
})
