import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { App } from '../App'
import { useRiderStore } from '../stores/riderStore'

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  playIncomingSound: vi.fn(),
}))

const rider: User = {
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
  __typename: 'RiderProfile',
  id: 'r1',
  userId: 'u1',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '11 5555 1234',
  available: true,
  vehicle: { __typename: 'Vehicle', type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' },
  currentLocation: null,
}

const rawOffer = {
  __typename: 'TripOffer',
  id: 'of1',
  orderCount: 1,
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  expiresAt: null,
}

const rawTrip = {
  __typename: 'Trip',
  id: 't1',
  riderId: 'r1',
  status: 'ACTIVE',
  orders: [
    {
      __typename: 'TripOrder',
      orderId: 'o1',
      pickupBranchId: 'b1',
      pickupLocation: { __typename: 'GeoPoint', latitude: -34.6, longitude: -58.4 },
      deliveryAddress: {
        __typename: 'TripAddress',
        text: 'Av. Entrega 100',
        latitude: -34.61,
        longitude: -58.4,
      },
      status: 'READY_FOR_DELIVERY',
      pickedUpAt: null,
      deliveredAt: null,
    },
  ],
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  earnings: 900,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: null,
  expiresAt: null,
}

const rawOrder = {
  __typename: 'Order',
  id: 'o1',
  number: 'A-100',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: {
    __typename: 'Address',
    text: 'Av. Entrega 100',
    latitude: -34.61,
    longitude: -58.4,
  },
  status: 'READY_FOR_DELIVERY',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  client: null,
  branch: null,
  riderId: 'r1',
  riderLocation: null,
}

const makeClient = (activeTrip: boolean) =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'RiderProfile':
        return { data: { riderProfile: rawRider } }
      case 'TripOffers':
        return { data: { tripOffers: [rawOffer] } }
      case 'MyTrips':
        return { data: { myTrips: activeTrip ? [rawTrip] : [] } }
      case 'Order':
        return { data: { order: rawOrder } }
      default:
        return { data: {} }
    }
  })

const renderApp = (route: string, activeTrip = false) => {
  const testClient = makeClient(activeTrip)
  renderWithProviders(<App />, { route, client: testClient.client })
  return testClient
}

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      bypassAuth: false,
    })
    useRiderStore.setState({ isOnline: true, location: null })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition: () => 1, clearWatch: () => {} },
    })
  })

  it('redirects unauthenticated users to the login page', async () => {
    renderApp('/')

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument()
  })

  it.each([
    ['/', 'Recibí y ejecutá viajes de entrega.'],
    ['/history', 'Historial de viajes'],
    ['/profile', 'Mi perfil'],
    ['/profile/edit', 'Editar perfil'],
    ['/profile/vehicle', 'Vehículo'],
  ])('lets the rider reach %s', async (route, text) => {
    useAuthStore.setState({ user: rider })
    renderApp(route)

    expect(await screen.findByText(text)).toBeInTheDocument()
  })

  it('mounts the trip detail page for the trip route', async () => {
    useAuthStore.setState({ user: rider })
    renderApp('/trip/o1', true)

    expect(await screen.findByText('Tu ganancia del viaje')).toBeInTheDocument()
  })

  it('uses the rider defaults for the register route', async () => {
    renderApp('/register')

    expect(await screen.findByText('Creá tu cuenta')).toBeInTheDocument()
    expect(screen.getByLabelText(/Marca/)).toBeInTheDocument()
    expect(screen.queryByText('Cliente')).not.toBeInTheDocument()
  })
})
