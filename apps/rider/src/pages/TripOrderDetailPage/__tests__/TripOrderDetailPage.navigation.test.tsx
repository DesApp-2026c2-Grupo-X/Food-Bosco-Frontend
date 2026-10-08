import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { InteractiveMap } from '@repo/components'
import { useActiveTrip, useOrder, useRiderProfile } from '@repo/api'
import type { GeoPoint, OrderStatus, Trip, TripOrder } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { TripOrderDetailPage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

const distanceState = vi.hoisted(() => ({ override: null as number | null }))

vi.mock('@repo/domain', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/domain')>()
  return {
    ...actual,
    haversineDistanceMeters: (from: GeoPoint, to: GeoPoint) =>
      distanceState.override ?? actual.haversineDistanceMeters(from, to),
  }
})

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  InteractiveMap: vi.fn(() => null),
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
const mapMock = InteractiveMap as unknown as Mock

const pickup: GeoPoint = { latitude: -34.6, longitude: -58.4 }
const delivery: GeoPoint = { latitude: -34.61, longitude: -58.4 }
const rider: GeoPoint = { latitude: -34.605, longitude: -58.4 }

const makeTripOrder = (status: OrderStatus): TripOrder => ({
  orderId: 'o1',
  pickupBranchId: 'b1',
  pickupLocation: pickup,
  deliveryAddress: { text: 'Av. Entrega 100', ...delivery },
  status,
  pickedUpAt: null,
  deliveredAt: null,
})

const makeTrip = (status: OrderStatus): Trip => ({
  id: 't1',
  riderId: 'r1',
  status: 'ACTIVE',
  orders: [makeTripOrder(status)],
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  earnings: 900,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: null,
  expiresAt: null,
})

interface SetupOptions {
  status?: OrderStatus
  riderLocation?: GeoPoint | null
}

const setup = (options: SetupOptions = {}) => {
  useRiderStore.setState({ isOnline: true, location: options.riderLocation ?? null })
  const pickupOrder = vi.fn().mockResolvedValue(undefined)
  const deliver = vi.fn().mockResolvedValue(undefined)

  tripMock.mockReturnValue({
    trip: makeTrip(options.status ?? 'READY_FOR_DELIVERY'),
    isLoading: false,
    isMutating: false,
    pickup: pickupOrder,
    deliver,
  })
  orderMock.mockReturnValue({ order: null, isLoading: false })
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

describe('TripOrderDetailPage navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    distanceState.override = null
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition: vi.fn().mockReturnValue(1), clearWatch: vi.fn() },
    })
  })

  it('polls the order every 15 seconds', () => {
    setup()
    renderPage()

    expect(orderMock).toHaveBeenCalledWith('o1', { pollIntervalMs: 15000 })
  })

  it('shows the branch destination before the pickup', () => {
    setup({ status: 'READY_FOR_DELIVERY' })
    renderPage()

    expect(screen.getByRole('button', { name: 'Navegar a la sucursal' })).toBeInTheDocument()
  })

  it('shows the delivery destination after the pickup', () => {
    setup({ status: 'ON_THE_WAY' })
    renderPage()

    expect(screen.getByRole('button', { name: 'Navegar a la entrega' })).toBeInTheDocument()
  })

  it('opens maps to the branch with the rider origin before the pickup', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    setup({ status: 'READY_FOR_DELIVERY', riderLocation: rider })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Navegar a la sucursal' }))

    const expected = `https://www.google.com/maps/dir/?api=1&destination=${pickup.latitude},${pickup.longitude}&travelmode=driving&origin=${rider.latitude},${rider.longitude}`
    expect(open).toHaveBeenCalledWith(expected, '_blank', 'noopener,noreferrer')
    vi.unstubAllGlobals()
  })

  it('opens maps to the delivery with the rider origin after the pickup', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    setup({ status: 'ON_THE_WAY', riderLocation: rider })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Navegar a la entrega' }))

    const expected = `https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}&travelmode=driving&origin=${rider.latitude},${rider.longitude}`
    expect(open).toHaveBeenCalledWith(expected, '_blank', 'noopener,noreferrer')
    vi.unstubAllGlobals()
  })

  it('allows the pickup at exactly the 50m boundary', () => {
    distanceState.override = 50
    setup({ status: 'READY_FOR_DELIVERY', riderLocation: rider })
    renderPage()

    expect(screen.getByRole('button', { name: 'Retirar' })).toBeEnabled()
  })

  it('blocks the pickup beyond the 50m limit', () => {
    distanceState.override = 50.5
    setup({ status: 'READY_FOR_DELIVERY', riderLocation: rider })
    renderPage()

    expect(screen.getByRole('button', { name: 'Retirar' })).toBeDisabled()
    expect(screen.getByText(/Acercate para continuar/)).toBeInTheDocument()
  })

  it('omits the rider marker when the location is unknown', () => {
    setup({ status: 'READY_FOR_DELIVERY', riderLocation: null })
    renderPage()

    const props = mapMock.mock.calls.at(-1)?.[0]
    expect(props.markers).toHaveLength(2)
    expect(props.markers.some((marker: { kind: string }) => marker.kind === 'rider')).toBe(false)
  })

  it('adds the rider marker when the location is known', () => {
    setup({ status: 'READY_FOR_DELIVERY', riderLocation: rider })
    renderPage()

    const props = mapMock.mock.calls.at(-1)?.[0]
    expect(props.markers).toHaveLength(3)
    expect(props.markers.some((marker: { kind: string }) => marker.kind === 'rider')).toBe(true)
  })
})
