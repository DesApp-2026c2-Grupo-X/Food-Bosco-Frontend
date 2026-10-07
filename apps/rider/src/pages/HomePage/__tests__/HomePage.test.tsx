import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useRiderProfile, useTripOffers } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  playIncomingSound: vi.fn(),
}))

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useTripOffers: vi.fn(),
  useActiveTrip: vi.fn(),
  useRiderProfile: vi.fn(),
}))

const offersMock = useTripOffers as unknown as Mock
const tripMock = useActiveTrip as unknown as Mock
const profileMock = useRiderProfile as unknown as Mock

const offer = {
  id: 'of1',
  orderCount: 1,
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  expiresAt: null,
}

const activeTrip = {
  id: 't1',
  status: 'ACTIVE',
  orders: [{ orderId: 'o9', status: 'READY_FOR_DELIVERY' }],
}

interface SetupOptions {
  offer?: unknown
  offersLoading?: boolean
  isMutating?: boolean
  trip?: unknown
  tripLoading?: boolean
  isOnline?: boolean
}

const setup = (options: SetupOptions = {}) => {
  useRiderStore.setState({ isOnline: options.isOnline ?? true, location: null })

  const accept = vi.fn().mockResolvedValue(undefined)
  const reject = vi.fn().mockResolvedValue(undefined)

  offersMock.mockReturnValue({
    offer: 'offer' in options ? options.offer : offer,
    isLoading: options.offersLoading ?? false,
    isMutating: options.isMutating ?? false,
    accept,
    reject,
  })
  tripMock.mockReturnValue({
    trip: options.trip ?? null,
    isLoading: options.tripLoading ?? false,
    isMutating: false,
    pickup: vi.fn(),
    deliver: vi.fn(),
  })
  profileMock.mockReturnValue({
    profile: null,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle: vi.fn(),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })

  return { accept, reject }
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition: vi.fn().mockReturnValue(1), clearWatch: vi.fn() },
    })
  })

  it('renders the incoming trip offer', () => {
    setup()
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Nueva oferta de viaje')).toBeInTheDocument()
    expect(screen.getByText('Compartiendo ubicación')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
  })

  it('accepts the offer through the API hook', async () => {
    const { accept } = setup()
    renderWithProviders(<HomePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }))

    await waitFor(() => expect(accept).toHaveBeenCalledWith('of1'))
  })

  it('rejects and hides the offer', async () => {
    const { reject } = setup()
    renderWithProviders(<HomePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    await waitFor(() => expect(reject).toHaveBeenCalledWith('of1'))
    expect(await screen.findByText('Buscando viajes cerca tuyo…')).toBeInTheDocument()
    expect(screen.queryByText('Nueva oferta de viaje')).not.toBeInTheDocument()
  })

  it('shows the disconnected empty state when offline', () => {
    setup({ isOnline: false })
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Estás desconectado')).toBeInTheDocument()
    expect(screen.getByText('Desconectado — no recibís viajes')).toBeInTheDocument()
    expect(screen.queryByText('Nueva oferta de viaje')).not.toBeInTheDocument()
  })

  it('shows the searching state when there is no offer', () => {
    setup({ offer: null })
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Buscando viajes cerca tuyo…')).toBeInTheDocument()
  })

  it('hides the offer while the data is loading', () => {
    setup({ offersLoading: true })
    renderWithProviders(<HomePage />)

    expect(screen.queryByText('Inicio')).not.toBeInTheDocument()
    expect(screen.queryByText('Nueva oferta de viaje')).not.toBeInTheDocument()
  })

  it('redirects to the active trip detail instead of showing an offer', async () => {
    setup({ trip: activeTrip })
    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trip/:orderId" element={<div>Detalle del viaje</div>} />
      </Routes>,
      { route: '/' },
    )

    expect(await screen.findByText('Detalle del viaje')).toBeInTheDocument()
  })
})
