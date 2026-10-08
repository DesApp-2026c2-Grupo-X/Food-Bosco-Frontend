import { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import type { Order, OrderStatus } from '@repo/domain'
import { useOrderTransition } from '@repo/api'
import { OrderDetailView } from '@repo/components'
import { renderWithProviders } from '@test/utils'

vi.mock('@repo/api', () => ({
  useOrderTransition: vi.fn(),
}))

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
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
  items: [],
  ...overrides,
})

interface MockOptions {
  order: Order | null
  isLoading?: boolean
  isMutating?: boolean
  onChange?: (orderId: string | undefined, status: OrderStatus) => Promise<void>
}

const mockTransition = ({
  order,
  isLoading = false,
  isMutating = false,
  onChange = vi.fn(),
}: MockOptions) =>
  vi.mocked(useOrderTransition).mockImplementation((orderId) => {
    const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('')
    const [confirmOpen, setConfirmOpen] = useState(false)

    return {
      order,
      isLoading,
      isMutating,
      nextStatus,
      setNextStatus,
      confirmOpen,
      requestChange: (status: OrderStatus) => {
        setNextStatus(status)
        setConfirmOpen(true)
      },
      confirmChange: async () => {
        if (!nextStatus) return
        await onChange(orderId, nextStatus)
        setConfirmOpen(false)
        setNextStatus('')
      },
      cancel: () => {
        setConfirmOpen(false)
        setNextStatus('')
      },
    }
  })

const renderDetail = () =>
  renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderDetailView />} />
    </Routes>,
    { route: '/orders/o1' },
  )

describe('OrderDetailRoute', () => {
  beforeEach(() => {
    mockTransition({ order: makeOrder() })
  })

  it('enables Cambiar estado once a transition is selected', async () => {
    renderDetail()

    const button = screen.getByRole('button', { name: 'Cambiar estado' })
    expect(button).toBeDisabled()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')

    expect(button).toBeEnabled()
    expect(vi.mocked(useOrderTransition)).toHaveBeenCalledWith('o1')
  })

  it('confirms the change with the order id and selected status', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined)
    mockTransition({ order: makeOrder(), onChange })
    renderDetail()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }))

    expect(await screen.findByText('Confirmar cambio de estado')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('o1', 'CONFIRMED'))
  })

  it('cancels the confirmation without mutating the order', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined)
    mockTransition({ order: makeOrder(), onChange })
    renderDetail()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(onChange).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.queryByText('Confirmar cambio de estado')).not.toBeInTheDocument(),
    )
  })

  it('shows a message when there are no available transitions', () => {
    mockTransition({ order: makeOrder({ availableTransitions: [] }) })
    renderDetail()

    expect(
      screen.getByText('No hay transiciones disponibles para este pedido.'),
    ).toBeInTheDocument()
  })

  it('shows the not found state when the order does not exist', () => {
    mockTransition({ order: null })
    renderDetail()

    expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument()
  })
})
