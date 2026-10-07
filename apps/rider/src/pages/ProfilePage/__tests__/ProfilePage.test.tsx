import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useAuthStore, useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProfilePage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }))

vi.mock('@repo/auth', () => ({
  useLogout: () => logout,
}))

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
  useActiveTrip: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock
const tripMock = useActiveTrip as unknown as Mock

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
  trip?: unknown
  profile?: unknown
  setAvailability?: Mock
}

const setup = (options: SetupOptions = {}) => {
  const setAvailability = options.setAvailability ?? vi.fn().mockResolvedValue(undefined)
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
  useRiderStore.setState({ isOnline: options.isOnline ?? true, location: null })
  profileMock.mockReturnValue({
    profile: 'profile' in options ? options.profile : profile,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle: vi.fn(),
    setAvailability,
    updateLocation: vi.fn(),
  })
  tripMock.mockReturnValue({
    trip: options.trip ?? null,
    isLoading: false,
    isMutating: false,
    pickup: vi.fn(),
    deliver: vi.fn(),
  })
  return { setAvailability }
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the rider identity and vehicle description', () => {
    setup()
    renderWithProviders(<ProfilePage />)

    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByText('rider@b.com')).toBeInTheDocument()
    expect(screen.getByText('Moto · Honda · CG · AB123')).toBeInTheDocument()
  })

  it('turns the availability off', async () => {
    const { setAvailability } = setup({ isOnline: true })
    renderWithProviders(<ProfilePage />)

    await userEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => expect(setAvailability).toHaveBeenCalledWith(false))
    expect(useRiderStore.getState().isOnline).toBe(false)
  })

  it('locks availability while a trip is in progress', async () => {
    const { setAvailability } = setup({ trip: { id: 't1', status: 'ACTIVE', orders: [] } })
    renderWithProviders(<ProfilePage />)

    expect(
      screen.getByText('No podés desconectarte con un viaje en curso.'),
    ).toBeInTheDocument()
    const toggle = screen.getByRole('checkbox')
    expect(toggle).toBeDisabled()

    await userEvent.click(toggle)
    expect(setAvailability).not.toHaveBeenCalled()
  })

  it('disables the vehicle shortcut while online and enables it when offline', () => {
    setup({ isOnline: true })
    const { unmount } = renderWithProviders(<ProfilePage />)
    expect(screen.getByText('Desconectate para cambiarlo')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Vehículo/ })).not.toBeInTheDocument()
    unmount()

    setup({ isOnline: false })
    renderWithProviders(<ProfilePage />)
    expect(screen.getByRole('link', { name: /Vehículo/ })).toBeInTheDocument()
  })

  it('logs out from the session button', async () => {
    setup()
    renderWithProviders(<ProfilePage />)

    await userEvent.click(screen.getByRole('button', { name: /Cerrar sesión/ }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
