import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { formatPrice, type Trip } from '@repo/domain'
import { useMyTrips } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { HistoryPage } from '../index'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useMyTrips: vi.fn(),
}))

const tripsMock = useMyTrips as unknown as Mock

const priceText = (value: number) => formatPrice(value).replace(/\u00a0/g, ' ')

const completedTrip: Trip = {
  id: 't1',
  riderId: 'r1',
  status: 'COMPLETED',
  orders: [
    {
      orderId: 'o1',
      pickupBranchId: 'b1',
      pickupLocation: { latitude: -34.6, longitude: -58.4 },
      deliveryAddress: { text: 'Av. Entrega 100', latitude: -34.61, longitude: -58.4 },
      status: 'DELIVERED',
      pickedUpAt: '2025-01-01T10:20:00Z',
      deliveredAt: '2025-01-01T10:50:00Z',
    },
  ],
  distanceKm: 4,
  estimatedMinutes: 20,
  estimatedEarnings: 500,
  earnings: 500,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: '2025-01-01T11:00:00Z',
  expiresAt: null,
}

const activeTrip: Trip = { ...completedTrip, id: 't2', status: 'ACTIVE', earnings: 999 }

const mockTrips = (trips: Trip[], isLoading = false) => {
  tripsMock.mockReturnValue({ trips, isLoading })
}

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTrips([])
  })

  it('shows the empty state when there are no completed trips', () => {
    mockTrips([activeTrip])
    renderWithProviders(<HistoryPage />)

    expect(screen.getByText('Todavía no realizaste viajes')).toBeInTheDocument()
  })

  it('lists only the completed trips', () => {
    mockTrips([completedTrip, activeTrip])
    renderWithProviders(<HistoryPage />)

    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByText(priceText(500))).toBeInTheDocument()
    expect(screen.queryByText(priceText(999))).not.toBeInTheDocument()
    expect(screen.getByText(/1 orden/)).toBeInTheDocument()
  })

  it('shows neither trips nor the empty state while loading', () => {
    mockTrips([completedTrip], true)
    renderWithProviders(<HistoryPage />)

    expect(screen.getByText('Historial de viajes')).toBeInTheDocument()
    expect(screen.queryByText('Completado')).not.toBeInTheDocument()
    expect(screen.queryByText('Todavía no realizaste viajes')).not.toBeInTheDocument()
  })
})
