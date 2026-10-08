import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Branch, Order } from '@repo/domain'
import { ActiveOrderCard } from '../index'
import { renderWithProviders } from '@test/utils'

const branch: Branch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  riderId: null,
  riderLocation: null,
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PREPARING',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

describe('ActiveOrderCard', () => {
  it('falls back to a generic branch and an estimating ETA', () => {
    renderWithProviders(<ActiveOrderCard order={order()} />)

    expect(screen.getByText(/Sucursal · Estimando tiempo/)).toBeInTheDocument()
  })

  it('shows the branch name and a formatted estimated time', () => {
    const eta = new Date(Date.now() + 30 * 60_000).toISOString()
    renderWithProviders(<ActiveOrderCard order={order({ branch, estimatedDeliveryAt: eta })} />)

    expect(screen.getByText(/Centro · ~30 min/)).toBeInTheDocument()
  })

  it('renders the status badge and links to the tracking page', () => {
    renderWithProviders(<ActiveOrderCard order={order({ status: 'ON_THE_WAY' })} />)

    expect(screen.getAllByText('En camino').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Ver seguimiento' })).toHaveAttribute(
      'href',
      '/orders/o1',
    )
  })
})
