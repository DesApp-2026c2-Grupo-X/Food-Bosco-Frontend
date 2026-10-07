import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditProfilePage } from '../index'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({
  useProfile: vi.fn(),
}))

vi.mock('@repo/api', () => ({
  useProfile: api.useProfile,
}))

const user = {
  id: 'u1',
  email: 'ana@bosco.com',
  role: 'customer' as const,
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '+54 11 5555-1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const setup = (updateProfile = vi.fn().mockResolvedValue(undefined)) => {
  api.useProfile.mockReturnValue({ user, isLoading: false, updateProfile })
  return { updateProfile, ...renderWithProviders(<EditProfilePage />) }
}

const saveButton = () => screen.getByRole('button', { name: 'Guardar cambios' })

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the profile prefilled with the current user', () => {
    setup()

    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Apellido')).toHaveValue('Pérez')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('+54 11 5555-1234')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('ana@bosco.com')
    expect(saveButton()).toBeDisabled()
  })

  it('validates required fields', async () => {
    const { updateProfile } = setup()

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.clear(firstName)
    await userEvent.tab()

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('validates the phone format', async () => {
    setup()

    const phone = screen.getByLabelText('Teléfono')
    await userEvent.clear(phone)
    await userEvent.type(phone, 'abc')
    await userEvent.tab()

    expect(await screen.findByText('Ingresá un teléfono válido')).toBeInTheDocument()
  })

  it('saves the changes and submits the parsed values', async () => {
    const { updateProfile } = setup()

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.clear(firstName)
    await userEvent.type(firstName, 'Ana María')

    await waitFor(() => expect(saveButton()).toBeEnabled())
    await userEvent.click(saveButton())

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        firstName: 'Ana María',
        lastName: 'Pérez',
        phone: '+54 11 5555-1234',
      }),
    )
  })

  it('shows an error when saving fails', async () => {
    const updateProfile = vi.fn().mockRejectedValue(new Error('boom'))
    setup(updateProfile)

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.clear(firstName)
    await userEvent.type(firstName, 'Ana María')
    await waitFor(() => expect(saveButton()).toBeEnabled())
    await userEvent.click(saveButton())

    expect(
      await screen.findByText('No pudimos guardar tus datos. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })

  it('cancels the edition and restores the original values', async () => {
    setup()

    const firstName = screen.getByLabelText('Nombre')
    await userEvent.clear(firstName)
    await userEvent.type(firstName, 'Otra')
    await waitFor(() => expect(saveButton()).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(saveButton()).toBeDisabled()
  })
})
