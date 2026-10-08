import type { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { formatOrderDate } from '@repo/domain'
import { OrderDetailPage } from '../index'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return {
    ...actual,
    InteractiveMap: ({
      markers,
      alt,
      legend,
    }: {
      markers: { kind?: string }[]
      alt?: string
      legend?: ReactNode
    }) => (
      <div data-testid="tracking-map" aria-label={alt}>
        {markers.map((marker, index) => (
          <span key={index} data-testid={`marker-${marker.kind}`} />
        ))}
        <div data-testid="map-legend">{legend}</div>
      </div>
    ),
  }
})

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const rawOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: rawBranch,
  client: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PREPARING',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  riderId: null,
  riderLocation: null,
  ...overrides,
})

const buildClient = (order: unknown) =>
  createTestClient((operation) => {
    if (operation.operationName === 'Order') {
      return { data: { order } }
    }
    return { data: {} }
  })

const renderDetail = (client: TestApolloClient) =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    </Routes>,
    { client: client.client, route: '/orders/o1' },
  )

describe('OrderDetailPage', () => {
  it('shows the timeline and branch/client markers for an active order', async () => {
    renderDetail(buildClient(rawOrder()))

    expect(await screen.findByText('Estado del pedido')).toBeInTheDocument()
    expect(screen.getByText('Preparando')).toBeInTheDocument()
    expect(screen.getByTestId('marker-branch')).toBeInTheDocument()
    expect(screen.getByTestId('marker-client')).toBeInTheDocument()
    expect(screen.queryByTestId('marker-rider')).not.toBeInTheDocument()
    expect(screen.getByText('Tienda')).toBeInTheDocument()
    expect(screen.getByText('Tu dirección')).toBeInTheDocument()
  })

  it('adds the rider marker when a rider location is available', async () => {
    renderDetail(
      buildClient(
        rawOrder({ riderId: 'r1', riderLocation: { latitude: -34.61, longitude: -58.41 } }),
      ),
    )

    expect(await screen.findByTestId('marker-rider')).toBeInTheDocument()
    expect(screen.getByText('Rider')).toBeInTheDocument()
  })

  it('renders the cancelled card', async () => {
    renderDetail(buildClient(rawOrder({ status: 'CANCELLED' })))

    expect(await screen.findByText('Pedido cancelado')).toBeInTheDocument()
    expect(screen.queryByText('Estado del pedido')).not.toBeInTheDocument()
  })

  it('shows the delivered timestamp', async () => {
    renderDetail(
      buildClient(
        rawOrder({
          branch: null,
          status: 'DELIVERED',
          statusHistory: [
            {
              previousStatus: 'ON_THE_WAY',
              newStatus: 'DELIVERED',
              changedAt: '2025-01-02T11:00:00Z',
            },
          ],
        }),
      ),
    )

    expect((await screen.findAllByText('Entregado')).length).toBeGreaterThan(0)
    expect(screen.getByText(/Recibido el/)).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(formatOrderDate('2025-01-02T11:00:00Z'))),
    ).toBeInTheDocument()
  })

  it('shows a spinner while loading', () => {
    const client = createTestClient((operation) => {
      if (operation.operationName === 'Order') {
        return new Promise<never>(() => {})
      }
      return { data: {} }
    })

    const { container } = renderDetail(client)

    expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
    expect(screen.queryByText('Pedido no encontrado')).not.toBeInTheDocument()
  })

  it('shows the not-found state when the order does not exist', async () => {
    renderDetail(buildClient(null))

    expect(await screen.findByText('Pedido no encontrado')).toBeInTheDocument()
  })
})
