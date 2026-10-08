import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { OrderDetailView } from '@repo/components'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const user = userEvent.setup({ pointerEventsCheck: 0 })

const superAdmin: User = {
  id: 'u1',
  email: 'admin@bosco.test',
  role: 'super_admin',
  firstName: 'Ada',
  lastName: 'Admin',
  phone: '11 5555 1111',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const makeRawOrder = () => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: { id: 'b1', name: 'Centro' },
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [
    {
      productId: 'p1',
      name: 'Hamburguesa',
      unitPrice: 2500,
      quantity: 1,
      observations: null,
      subtotal: 2500,
      options: [],
    },
  ],
  statusHistory: [],
  availableTransitions: ['CONFIRMED'],
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
})

const makeClient = () => {
  const order: Record<string, unknown> | null = makeRawOrder()

  return createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminOrder':
        return { data: { order } }
      case 'ChangeOrderStatus': {
        const variables = operation.variables as { orderId: string; status: string }
        if (order) {
          order.status = variables.status
          order.availableTransitions = []
        }
        return { data: { changeOrderStatus: order } }
      }
      default:
        return { data: {} }
    }
  })
}

const makeNotFoundClient = () =>
  createTestClient((operation) => {
    if (operation.operationName === 'AdminOrder') return { data: { order: null } }
    return { data: {} }
  })

const renderFlow = (client: ReturnType<typeof makeClient>) =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderDetailView />} />
    </Routes>,
    { route: '/orders/o1', client: client.client },
  )

describe('admin order detail flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: superAdmin })
  })

  it('changes the order status end to end and refetches the order', async () => {
    const testClient = makeClient()
    renderFlow(testClient)

    expect(await screen.findByText('Ana Perez')).toBeInTheDocument()
    expect(screen.getByText(/Hamburguesa/)).toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }))

    expect(await screen.findByText('Confirmar cambio de estado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('ChangeOrderStatus'))).toEqual({
        orderId: 'o1',
        status: 'CONFIRMED',
      }),
    )

    expect(testClient.requestsByName('AdminOrder').length).toBeGreaterThan(1)
    expect(
      await screen.findByText('No hay transiciones disponibles para este pedido.'),
    ).toBeInTheDocument()
  })

  it('cancels the confirmation without mutating the order', async () => {
    const testClient = makeClient()
    renderFlow(testClient)

    await screen.findByText('Ana Perez')

    await user.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }))
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(testClient.requestsByName('ChangeOrderStatus')).toHaveLength(0)
    await waitFor(() =>
      expect(screen.queryByText('Confirmar cambio de estado')).not.toBeInTheDocument(),
    )
  })

  it('shows the not found state when the order does not exist', async () => {
    renderFlow(makeNotFoundClient())

    expect(await screen.findByText('Pedido no encontrado')).toBeInTheDocument()
  })
})
