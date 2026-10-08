import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup({ pointerEventsCheck: 0 })
import { Link, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import type { GeoPoint, OrderStatus, TripStatus, User } from '@repo/domain'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { HistoryPage } from '../pages/HistoryPage'
import { HomePage } from '../pages/HomePage'
import { TripOrderDetailPage } from '../pages/TripOrderDetailPage'
import { useRiderStore } from '../stores/riderStore'

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  playIncomingSound: vi.fn(),
  InteractiveMap: () => null,
}))

const PICKUP: GeoPoint = { latitude: -34.6, longitude: -58.4 }
const DELIVERY: GeoPoint = { latitude: -34.61, longitude: -58.4 }
const FAR_AWAY: GeoPoint = { latitude: -34.7, longitude: -58.4 }

const riderUser: User = {
  id: 'u1',
  email: 'rider@bosco.test',
  role: 'rider',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '11 5555 1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const rawRider = {
  id: 'r1',
  userId: 'u1',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '11 5555 1234',
  available: true,
  vehicle: { type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' },
  currentLocation: null,
}

const rawOffer = {
  id: 'of1',
  orderCount: 1,
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  expiresAt: null,
}

const makeRawOrder = (status: OrderStatus) => ({
  id: 'o1',
  number: 'A-100',
  clientId: 'c1',
  branchId: 'b1',
  branch: {
    id: 'b1',
    name: 'Sucursal Centro',
    addressText: 'Calle 1',
    latitude: PICKUP.latitude,
    longitude: PICKUP.longitude,
    phone: null,
    active: true,
    hours: [],
  },
  client: {
    id: 'c1',
    email: 'ana@b.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    active: true,
    branchId: null,
  },
  deliveryAddress: {
    text: 'Av. Entrega 100',
    latitude: DELIVERY.latitude,
    longitude: DELIVERY.longitude,
  },
  status,
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  riderId: 'r1',
  riderLocation: null,
})

const makeRawTrip = (orderStatus: OrderStatus, tripStatus: TripStatus) => ({
  id: 't1',
  riderId: 'r1',
  status: tripStatus,
  orders: [
    {
      orderId: 'o1',
      pickupBranchId: 'b1',
      pickupLocation: {
        latitude: PICKUP.latitude,
        longitude: PICKUP.longitude,
      },
      deliveryAddress: {
        text: 'Av. Entrega 100',
        latitude: DELIVERY.latitude,
        longitude: DELIVERY.longitude,
      },
      status: orderStatus,
      pickedUpAt: orderStatus === 'READY_FOR_DELIVERY' ? null : '2025-01-01T10:20:00Z',
      deliveredAt: orderStatus === 'DELIVERED' ? '2025-01-01T10:40:00Z' : null,
    },
  ],
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  earnings: tripStatus === 'COMPLETED' ? 900 : null,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: tripStatus === 'COMPLETED' ? '2025-01-01T10:40:00Z' : null,
  expiresAt: null,
})

const createState = (withTrip: boolean) => ({
  offers: withTrip ? [] : [rawOffer],
  tripOrderStatus: 'READY_FOR_DELIVERY' as OrderStatus,
  tripStatus: (withTrip ? 'ACTIVE' : null) as TripStatus | null,
})

const makeClient = (withTrip = false) => {
  const state = createState(withTrip)

  return createTestClient((operation) => {
    switch (operation.operationName) {
      case 'RiderProfile':
        return { data: { riderProfile: rawRider } }
      case 'TripOffers':
        return { data: { tripOffers: state.offers } }
      case 'MyTrips':
        return {
          data: {
            myTrips: state.tripStatus ? [makeRawTrip(state.tripOrderStatus, state.tripStatus)] : [],
          },
        }
      case 'Order':
        return { data: { order: makeRawOrder(state.tripOrderStatus) } }
      case 'AcceptTripOffer':
        state.offers = []
        state.tripStatus = 'ACTIVE'
        state.tripOrderStatus = 'READY_FOR_DELIVERY'
        return { data: { acceptTripOffer: makeRawTrip('READY_FOR_DELIVERY', 'ACTIVE') } }
      case 'RejectTripOffer': {
        const { offerId } = operationVariables(operation) as { offerId: string }
        state.offers = state.offers.filter((offer) => offer.id !== offerId)
        return { data: { rejectTripOffer: true } }
      }
      case 'MarkOrderPickup':
        state.tripOrderStatus = 'ON_THE_WAY'
        return { data: { markOrderPickup: makeRawTrip('ON_THE_WAY', 'ACTIVE') } }
      case 'MarkOrderDelivered':
        state.tripOrderStatus = 'DELIVERED'
        state.tripStatus = 'COMPLETED'
        return { data: { markOrderDelivered: makeRawTrip('DELIVERED', 'COMPLETED') } }
      case 'UpdateRiderLocation':
        return { data: { updateRiderLocation: rawRider } }
      default:
        return { data: {} }
    }
  })
}

const FlowRoutes = () => (
  <>
    <Link to="/history">Ver historial</Link>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trip/:orderId" element={<TripOrderDetailPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  </>
)

const renderFlow = (route: string, withTrip = false) => {
  const client = makeClient(withTrip)
  renderWithProviders(<FlowRoutes />, { route, client: client.client })
  return client
}

let setPosition: (point: GeoPoint) => void

describe('rider delivery flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: riderUser,
      accessToken: 'access',
      refreshToken: 'refresh',
      bypassAuth: false,
    })
    useRiderStore.setState({ isOnline: true, location: null })

    let onSuccess: PositionCallback | null = null
    setPosition = (point) => {
      onSuccess?.({
        coords: { latitude: point.latitude, longitude: point.longitude, accuracy: 5 },
      } as GeolocationPosition)
    }
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition: (success: PositionCallback) => {
          onSuccess = success
          return 1
        },
        clearWatch: vi.fn(),
      },
    })
    Object.defineProperty(window, 'open', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
  })

  it('runs the full delivery flow from offer to history', async () => {
    const client = renderFlow('/')

    expect(await screen.findByText('Nueva oferta de viaje')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aceptar' }))
    await waitFor(() =>
      expect(operationVariables(client.lastRequest('AcceptTripOffer'))).toEqual({
        offerId: 'of1',
      }),
    )

    expect(await screen.findByRole('button', { name: 'Retirar' })).toBeInTheDocument()

    await act(async () => {
      setPosition(PICKUP)
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retirar' })).toBeEnabled())

    await user.click(screen.getByRole('button', { name: 'Retirar' }))
    await waitFor(() =>
      expect(operationVariables(client.lastRequest('MarkOrderPickup'))).toEqual({
        tripId: 't1',
        orderId: 'o1',
      }),
    )

    expect(await screen.findByRole('button', { name: 'Entregar' })).toBeInTheDocument()

    await act(async () => {
      setPosition(DELIVERY)
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entregar' })).toBeEnabled())

    await user.click(screen.getByRole('button', { name: 'Entregar' }))
    await waitFor(() =>
      expect(operationVariables(client.lastRequest('MarkOrderDelivered'))).toEqual({
        tripId: 't1',
        orderId: 'o1',
      }),
    )

    expect(await screen.findByText('Buscando viajes cerca tuyo…')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ver historial' }))
    expect(await screen.findByText('Completado')).toBeInTheDocument()
  })

  it('rejects an offer and returns to the searching empty state', async () => {
    const client = renderFlow('/')

    expect(await screen.findByText('Nueva oferta de viaje')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Rechazar' }))
    await waitFor(() =>
      expect(operationVariables(client.lastRequest('RejectTripOffer'))).toEqual({
        offerId: 'of1',
      }),
    )

    expect(await screen.findByText('Buscando viajes cerca tuyo…')).toBeInTheDocument()
    expect(screen.queryByText('Nueva oferta de viaje')).not.toBeInTheDocument()
  })

  it('blocks the pickup when the rider is more than 50m away', async () => {
    renderFlow('/trip/o1', true)

    expect(await screen.findByRole('button', { name: 'Retirar' })).toBeInTheDocument()

    await act(async () => {
      setPosition(FAR_AWAY)
    })

    expect(await screen.findByText(/Acercate para continuar/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retirar' })).toBeDisabled()
  })
})
