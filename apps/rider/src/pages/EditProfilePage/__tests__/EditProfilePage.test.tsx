import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useAuthStore, useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { EditProfilePage } from '../index'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock

const setup = (updateProfile: Mock = vi.fn().mockResolvedValue(undefined)) => {
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'rider@b.com',
      role: 'rider',
      firstName: 'Juan',
      lastName: 'Perez',
      phone: '123',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  profileMock.mockReturnValue({
    profile: {
      id: 'r1',
      userId: 'u1',
      firstName: 'Juan',
      lastName: 'Perez',
      phone: '5551234',
      available: true,
      vehicle: { type: 'bici' },
      currentLocation: null,
    },
    isLoading: false,
    isMutating: false,
    updateProfile,
    updateVehicle: vi.fn(),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
  return { updateProfile }
}

const submit = () => screen.getByRole('button', { name: 'Guardar cambios' })
const phoneField = () => screen.findByLabelText('Teléfono')

describe('EditProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the rider name and prefilled phone', async () => {
    setup()
    renderWithProviders(<EditProfilePage />)

    expect(screen.getByText('Editar perfil')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument()
    expect(await phoneField()).toHaveValue('5551234')
  })

  it('blocks the submit and shows the required error when the phone is empty', async () => {
    const { updateProfile } = setup()
    renderWithProviders(<EditProfilePage />)

    await userEvent.clear(await phoneField())
    await userEvent.click(submit())

    expect(await screen.findByText('Este campo es requerido')).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('rejects an invalid phone number', async () => {
    const { updateProfile } = setup()
    renderWithProviders(<EditProfilePage />)

    const phone = await phoneField()
    await userEvent.clear(phone)
    await userEvent.type(phone, 'abc')
    await userEvent.click(submit())

    expect(await screen.findByText('Ingresá un teléfono válido')).toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('saves the trimmed phone number', async () => {
    const { updateProfile } = setup()
    renderWithProviders(<EditProfilePage />)

    const phone = await phoneField()
    await userEvent.clear(phone)
    await userEvent.type(phone, '  999 1234  ')

    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ phone: '999 1234' }))
  })

  it('surfaces a friendly error when saving fails', async () => {
    setup(vi.fn().mockRejectedValue(new Error('boom')))
    renderWithProviders(<EditProfilePage />)

    const phone = await phoneField()
    await userEvent.clear(phone)
    await userEvent.type(phone, '9991234')

    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())

    expect(
      await screen.findByText('No pudimos guardar tus datos. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })
})
