import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useOrder, useRiderProfile } from '@repo/api'
import type { GeoPoint, Order, OrderStatus, Trip, TripOrder } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { TripOrderDetailPage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  InteractiveMap: () => null,
}))

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useActiveTrip: vi.fn(),
  useOrder: vi.fn(),
  useRiderProfile: vi.fn(),
}))

const tripMock = useActiveTrip as unknown as Mock
const orderMock = useOrder as unknown as Mock
const profileMock = useRiderProfile as unknown as Mock

const pickup: GeoPoint = { latitude: -34.6, longitude: -58.4 }
const delivery: GeoPoint = { latitude: -34.61, longitude: -58.4 }
const farAway: GeoPoint = { latitude: -34.63, longitude: -58.4 }

const makeTripOrder = (overrides: Partial<TripOrder> = {}): TripOrder => ({
  orderId: 'o1',
  pickupBranchId: 'b1',
  pickupLocation: pickup,
  deliveryAddress: { text: 'Av. Entrega 100', ...delivery },
  status: 'READY_FOR_DELIVERY',
  pickedUpAt: null,
  deliveredAt: null,
  ...overrides,
})

const makeTrip = (status: OrderStatus = 'READY_FOR_DELIVERY', earnings: number | null = 900): Trip => ({
  id: 't1',
  riderId: 'r1',
  status: 'ACTIVE',
  orders: [makeTripOrder({ status })],
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  earnings,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: null,
  expiresAt: null,
})

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: 'A-100',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Av. Entrega 100', ...delivery },
  status: 'READY_FOR_DELIVERY',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  statusHistory: [],
  availableTransitions: [],
  items: [
    {
      productId: 'p1',
      name: 'Milanesa',
      unitPrice: 1000,
      quantity: 2,
      observations: null,
      subtotal: 2000,
      options: [],
    },
  ],
  client: {
    id: 'c1',
    email: 'ana@b.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  branch: {
    id: 'b1',
    name: 'Sucursal Centro',
    addressText: 'Calle 1',
    latitude: pickup.latitude,
    longitude: pickup.longitude,
    phone: null,
    active: true,
    hours: [],
  },
  ...overrides,
})

interface SetupOptions {
  trip?: unknown
  tripLoading?: boolean
  order?: unknown
  orderLoading?: boolean
  isMutating?: boolean
  riderLocation?: GeoPoint | null
}

const setup = (options: SetupOptions = {}) => {
  useRiderStore.setState({ isOnline: true, location: options.riderLocation ?? null })

  const pickupOrder = vi.fn().mockResolvedValue(undefined)
  const deliver = vi.fn().mockResolvedValue(undefined)

  tripMock.mockReturnValue({
    trip: 'trip' in options ? options.trip : makeTrip(),
    isLoading: options.tripLoading ?? false,
    isMutating: options.isMutating ?? false,
    pickup: pickupOrder,
    deliver,
  })
  orderMock.mockReturnValue({
    order: 'order' in options ? options.order : makeOrder(),
    isLoading: options.orderLoading ?? false,
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

  return { pickupOrder, deliver }
}

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/trip/:orderId" element={<TripOrderDetailPage />} />
      <Route path="/" element={<div>Inicio del rider</div>} />
    </Routes>,
    { route: '/trip/o1' },
  )

describe('TripOrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition: vi.fn().mockReturnValue(1), clearWatch: vi.fn() },
    })
  })

  it('marks the pickup when the rider is at the branch', async () => {
    const { pickupOrder } = setup({ riderLocation: pickup })
    renderPage()

    const button = screen.getByRole('button', { name: 'Retirar' })
    expect(button).toBeEnabled()

    await userEvent.click(button)

    await waitFor(() => expect(pickupOrder).toHaveBeenCalledWith('o1'))
  })

  it('blocks the pickup and shows the distance when the rider is too far', () => {
    setup({ riderLocation: farAway })
    renderPage()

    expect(screen.getByRole('button', { name: 'Retirar' })).toBeDisabled()
    expect(screen.getByText(/Acercate para continuar/)).toBeInTheDocument()
  })

  it('asks to enable location when the rider position is unknown', () => {
    setup({ riderLocation: null })
    renderPage()

    expect(screen.getByRole('button', { name: 'Retirar' })).toBeDisabled()
    expect(
      screen.getByText('Activamos tu ubicación para verificar que estás en el punto.'),
    ).toBeInTheDocument()
  })

  it('delivers and returns home once the order was picked up', async () => {
    const { deliver } = setup({ trip: makeTrip('ON_THE_WAY'), riderLocation: delivery })
    renderPage()

    const button = screen.getByRole('button', { name: 'Entregar' })
    expect(button).toBeEnabled()

    await userEvent.click(button)

    await waitFor(() => expect(deliver).toHaveBeenCalledWith('o1'))
    expect(await screen.findByText('Inicio del rider')).toBeInTheDocument()
  })

  it('shows the delivered confirmation for a delivered order', () => {
    setup({ trip: makeTrip('DELIVERED'), order: makeOrder({ status: 'DELIVERED' }) })
    renderPage()

    expect(screen.getAllByText('Entregado').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Retirar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Entregar' })).not.toBeInTheDocument()
  })

  it('shows an empty state when there is no active trip', () => {
    setup({ trip: null })
    renderPage()

    expect(screen.getByText('No hay viaje en curso')).toBeInTheDocument()
  })

  it('shows not found when the order is not part of the trip', () => {
    setup({ trip: { ...makeTrip(), orders: [makeTripOrder({ orderId: 'other' })] } })
    renderPage()

    expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument()
  })

  it('shows a loading state while the trip is loading', () => {
    setup({ tripLoading: true })
    renderPage()

    expect(screen.queryByText('Tu ganancia del viaje')).not.toBeInTheDocument()
    expect(screen.queryByText(/Pedido #/)).not.toBeInTheDocument()
  })

  it('labels the earnings as settled when the trip has a payout', () => {
    setup()
    renderPage()

    expect(screen.getByText('Acreditada')).toBeInTheDocument()
  })

  it('labels the earnings as estimated when the trip has no payout yet', () => {
    setup({ trip: makeTrip('READY_FOR_DELIVERY', null) })
    renderPage()

    expect(screen.getByText('Estimada')).toBeInTheDocument()
  })
})
