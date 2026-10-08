import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Order } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { OrdersListView } from '../OrdersListView'
import type { OrdersListViewProps } from '../OrdersListView/types'

const makeOrder = (overrides: Partial<Order> & { id: string }): Order => ({
  number: '100',
  clientId: 'c0',
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  statusHistory: [],
  availableTransitions: [],
  items: [],
  ...overrides,
})

const anaOrder = makeOrder({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  client: {
    id: 'c1',
    email: 'ana@test.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
})

const bobOrder = makeOrder({
  id: 'o2',
  number: '202',
  clientId: 'c2',
  status: 'DELIVERED',
  client: {
    id: 'c2',
    email: 'bob@test.com',
    role: 'customer',
    firstName: 'Bob',
    lastName: 'Solo',
    phone: '456',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
})

const render = (overrides: Partial<OrdersListViewProps> = {}) =>
  renderWithProviders(
    <OrdersListView
      orders={[anaOrder, bobOrder]}
      isLoading={false}
      description="Listado"
      orderDetailPath={(id) => `/orders/${id}`}
      {...overrides}
    />,
  )

describe('OrdersListView', () => {
  it('filtra por número y por cliente', async () => {
    const { unmount } = render()

    await userEvent.type(screen.getByPlaceholderText('Número o cliente...'), '202')
    await waitFor(() => expect(screen.queryByText('#101')).not.toBeInTheDocument())
    expect(screen.getByText('#202')).toBeInTheDocument()
    unmount()

    render()
    await userEvent.type(screen.getByPlaceholderText('Número o cliente...'), 'ana')
    await waitFor(() => expect(screen.queryByText('#202')).not.toBeInTheDocument())
    expect(screen.getByText('#101')).toBeInTheDocument()
  })

  it('filtra por estado', async () => {
    render()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'DELIVERED')

    await waitFor(() => expect(screen.queryByText('#101')).not.toBeInTheDocument())
    expect(screen.getByText('#202')).toBeInTheDocument()
  })

  it('con showBranchFilter lista sucursales y filtra por ellas', async () => {
    const centro = makeOrder({
      id: 'b1o',
      number: '301',
      branchId: 'b1',
      branch: {
        id: 'b1',
        name: 'Centro',
        addressText: 'a',
        latitude: 0,
        longitude: 0,
        phone: null,
        active: true,
        hours: [],
      },
    })
    const norte = makeOrder({
      id: 'b2o',
      number: '302',
      branchId: 'b2',
      branch: {
        id: 'b2',
        name: 'Norte',
        addressText: 'b',
        latitude: 0,
        longitude: 0,
        phone: null,
        active: true,
        hours: [],
      },
    })

    render({ orders: [centro, norte], showBranchFilter: true })

    expect(screen.getByRole('option', { name: 'Centro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Norte' })).toBeInTheDocument()

    await userEvent.selectOptions(screen.getAllByRole('combobox')[1] as HTMLElement, 'b1')

    await waitFor(() => expect(screen.queryByText('#302')).not.toBeInTheDocument())
    expect(screen.getByText('#301')).toBeInTheDocument()
  })

  it('usa — cuando no hay sucursal', () => {
    render({
      orders: [
        makeOrder({
          id: 'o3',
          number: '303',
          branchId: '',
          branch: null,
          client: {
            id: 'c3',
            email: 'car@test.com',
            role: 'customer',
            firstName: 'Carla',
            lastName: 'Gomez',
            phone: '789',
            active: true,
            createdAt: '2025-01-01T00:00:00Z',
          },
        }),
      ],
    })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('construye el enlace al detalle con orderDetailPath', () => {
    render({ orders: [anaOrder] })

    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '/orders/o1')
  })

  it('oculta la columna de sucursal según branchColumnHideBelow', () => {
    const { unmount } = render({ branchColumnHideBelow: 'md' })

    expect(window.getComputedStyle(screen.getByText('Sucursal')).display).toBe('none')
    unmount()

    render()
    expect(window.getComputedStyle(screen.getByText('Sucursal')).display).toBe('table-cell')
  })
})
