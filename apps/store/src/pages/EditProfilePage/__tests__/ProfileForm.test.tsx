import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileForm } from '../ProfileForm'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({ useProfile: vi.fn() }))
vi.mock('@repo/api', () => ({ useProfile: api.useProfile }))

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
  return { updateProfile, ...renderWithProviders(<ProfileForm />, { route: '/profile/edit' }) }
}

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing while the profile is loading', () => {
    api.useProfile.mockReturnValue({ user: null, isLoading: true, updateProfile: vi.fn() })

    const { container } = renderWithProviders(<ProfileForm />, { route: '/profile/edit' })

    expect(container).toBeEmptyDOMElement()
  })

  it('keeps the actions disabled until the form is dirty', async () => {
    setup()

    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Nombre'), '!')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled(),
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
  })

  it('shows an error when saving fails', async () => {
    const updateProfile = vi.fn().mockRejectedValue(new Error('boom'))
    setup(updateProfile)

    await userEvent.type(screen.getByLabelText('Nombre'), '!')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled(),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('No pudimos guardar tus datos. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })
})
