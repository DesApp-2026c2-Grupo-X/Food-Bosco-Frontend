import { screen } from '@testing-library/react'
import { Route, Routes, useParams } from 'react-router-dom'
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

const TripDetailProbe = () => {
  const { orderId } = useParams()
  return <div>{`Detalle ${orderId}`}</div>
}

const setup = (orders: { orderId: string; status: string }[]) => {
  useRiderStore.setState({ isOnline: true, location: null })
  offersMock.mockReturnValue({
    offer: null,
    isLoading: false,
    isMutating: false,
    accept: vi.fn(),
    reject: vi.fn(),
  })
  tripMock.mockReturnValue({
    trip: { id: 't1', status: 'ACTIVE', orders },
    isLoading: false,
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
}

const renderHome = () =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trip/:orderId" element={<TripDetailProbe />} />
    </Routes>,
    { route: '/' },
  )

describe('HomePage trip redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition: vi.fn().mockReturnValue(1), clearWatch: vi.fn() },
    })
  })

  it('does not redirect when every order is delivered', () => {
    setup([{ orderId: 'o1', status: 'DELIVERED' }])
    renderHome()

    expect(screen.getByText('Recibí y ejecutá viajes de entrega.')).toBeInTheDocument()
    expect(screen.queryByText(/Detalle/)).not.toBeInTheDocument()
  })

  it('redirects to the first non-delivered order', async () => {
    setup([
      { orderId: 'o1', status: 'DELIVERED' },
      { orderId: 'o2', status: 'READY_FOR_DELIVERY' },
      { orderId: 'o3', status: 'ON_THE_WAY' },
    ])
    renderHome()

    expect(await screen.findByText('Detalle o2')).toBeInTheDocument()
  })
})
