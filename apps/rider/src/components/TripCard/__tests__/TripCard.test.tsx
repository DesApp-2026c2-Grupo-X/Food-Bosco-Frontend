import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatOrderDate, formatPrice, type Trip } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { TripCard } from '../index'

const priceText = (value: number) => formatPrice(value).replace(/\u00a0/g, ' ')

const baseTrip: Trip = {
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
  estimatedEarnings: 800,
  earnings: 900,
  startedAt: '2025-01-01T10:00:00Z',
  completedAt: '2025-01-01T11:00:00Z',
  expiresAt: null,
}

describe('TripCard', () => {
  it('renders the completion date, order count, earnings and status', () => {
    renderWithProviders(<TripCard trip={baseTrip} />)

    expect(screen.getByText(formatOrderDate(baseTrip.completedAt as string))).toBeInTheDocument()
    expect(screen.getByText(/1 orden/)).toBeInTheDocument()
    expect(screen.getByText(priceText(900))).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
  })

  it('falls back to trip.distanceKm when there are no orders and defaults earnings to zero', () => {
    renderWithProviders(<TripCard trip={{ ...baseTrip, orders: [], earnings: null }} />)

    expect(screen.getByText('0 órdenes · 4 km')).toBeInTheDocument()
    expect(screen.getByText(priceText(0))).toBeInTheDocument()
  })

  it('shows a dash when the trip has no completion date', () => {
    renderWithProviders(<TripCard trip={{ ...baseTrip, completedAt: null }} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
