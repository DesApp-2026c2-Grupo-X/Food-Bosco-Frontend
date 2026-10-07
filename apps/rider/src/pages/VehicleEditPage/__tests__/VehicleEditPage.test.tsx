import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { VehicleEditPage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock

const profile = {
  id: 'r1',
  userId: 'u1',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '123',
  available: true,
  vehicle: { type: 'moto' as const, brand: 'Honda', model: 'CG', plate: 'AB123' },
  currentLocation: null,
}

interface SetupOptions {
  isOnline?: boolean
  profile?: unknown
  updateVehicle?: Mock
}

const setup = (options: SetupOptions = {}) => {
  const updateVehicle = options.updateVehicle ?? vi.fn().mockResolvedValue(undefined)
  useRiderStore.setState({ isOnline: options.isOnline ?? false, location: null })
  profileMock.mockReturnValue({
    profile: 'profile' in options ? options.profile : profile,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle,
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
  return { updateVehicle }
}

const submit = () => screen.getByRole('button', { name: 'Guardar cambios' })

describe('VehicleEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks vehicle editing while the rider is online', () => {
    setup({ isOnline: true })
    renderWithProviders(<VehicleEditPage />)

    expect(
      screen.getByText('No podés cambiar el vehículo mientras estás conectado'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Moto' })).not.toBeInTheDocument()
  })

  it('renders the moto fields prefilled from the profile', () => {
    setup()
    renderWithProviders(<VehicleEditPage />)

    expect(screen.getByLabelText(/Marca/)).toHaveValue('Honda')
    expect(screen.getByLabelText(/Modelo/)).toHaveValue('CG')
    expect(screen.getByLabelText(/Patente/)).toHaveValue('AB123')
  })

  it('validates the required moto fields before submitting', async () => {
    const { updateVehicle } = setup()
    renderWithProviders(<VehicleEditPage />)

    const brand = screen.getByLabelText(/Marca/)
    await userEvent.clear(brand)
    await userEvent.click(submit())

    expect(await screen.findByText('La marca es obligatoria')).toBeInTheDocument()
    expect(updateVehicle).not.toHaveBeenCalled()
  })

  it('saves the edited moto data', async () => {
    const { updateVehicle } = setup()
    renderWithProviders(<VehicleEditPage />)

    const model = screen.getByLabelText(/Modelo/)
    await userEvent.clear(model)
    await userEvent.type(model, 'NMAX')

    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())

    await waitFor(() =>
      expect(updateVehicle).toHaveBeenCalledWith({
        type: 'moto',
        brand: 'Honda',
        model: 'NMAX',
        plate: 'AB123',
      }),
    )
  })

  it('switches to a bike and saves immediately without the moto fields', async () => {
    const { updateVehicle } = setup()
    renderWithProviders(<VehicleEditPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Bici' }))

    await waitFor(() => expect(updateVehicle).toHaveBeenCalledWith({ type: 'bici' }))
    expect(
      await screen.findByText(/No requiere marca, modelo ni patente/),
    ).toBeInTheDocument()
  })

  it('surfaces an error when saving fails', async () => {
    setup({ updateVehicle: vi.fn().mockRejectedValue(new Error('boom')) })
    renderWithProviders(<VehicleEditPage />)

    const model = screen.getByLabelText(/Modelo/)
    await userEvent.clear(model)
    await userEvent.type(model, 'NMAX')

    await waitFor(() => expect(submit()).toBeEnabled())
    await userEvent.click(submit())

    expect(
      await screen.findByText('No pudimos guardar tu vehículo. Intentá de nuevo.'),
    ).toBeInTheDocument()
  })
})
