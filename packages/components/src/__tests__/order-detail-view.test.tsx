import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { useOrderTransition } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { OrderDetailView } from '../OrderDetailView'

vi.mock('@repo/api', () => ({ useOrderTransition: vi.fn() }))

const baseOrder: Order = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: null,
  client: {
    id: 'c1',
    email: 'ana@test.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '555-1234',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  statusHistory: [],
  availableTransitions: [],
  items: [],
}

const mockTransition = (overrides: Partial<ReturnType<typeof useOrderTransition>> = {}) =>
  vi.mocked(useOrderTransition).mockReturnValue({
    order: baseOrder,
    isLoading: false,
    isMutating: false,
    nextStatus: '',
    setNextStatus: vi.fn(),
    confirmOpen: false,
    requestChange: vi.fn(),
    confirmChange: vi.fn(),
    cancel: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useOrderTransition>)

const render = () => renderWithProviders(<OrderDetailView />, { route: '/orders/o1' })

describe('OrderDetailView', () => {
  beforeEach(() => mockTransition())

  it('muestra el vacío cuando el pedido no existe', () => {
    mockTransition({ order: null })

    render()

    expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument()
  })

  it('renderiza las secciones de cliente y entrega', () => {
    render()

    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
    expect(screen.getByText('555-1234')).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
    expect(screen.getByText('Av. Siempreviva 742')).toBeInTheDocument()
  })

  it('muestra el historial vacío o con entradas', () => {
    const { unmount } = render()
    expect(screen.getByText('Sin cambios de estado aún.')).toBeInTheDocument()
    unmount()

    mockTransition({
      order: {
        ...baseOrder,
        statusHistory: [
          { previousStatus: 'PENDING', newStatus: 'CONFIRMED', changedAt: '2025-01-01T11:00:00Z' },
        ],
      },
    })
    render()
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
  })

  it('muestra el mensaje cuando no hay transiciones', () => {
    render()

    expect(
      screen.getByText('No hay transiciones disponibles para este pedido.'),
    ).toBeInTheDocument()
  })

  it('selecciona la siguiente transición', async () => {
    const setNextStatus = vi.fn()
    mockTransition({ order: { ...baseOrder, availableTransitions: ['CONFIRMED'] }, setNextStatus })

    render()

    await userEvent.selectOptions(screen.getByRole('combobox'), 'CONFIRMED')

    expect(setNextStatus).toHaveBeenCalledWith('CONFIRMED')
  })

  it('deshabilita el botón hasta elegir un estado y luego pide el cambio', async () => {
    const requestChange = vi.fn()
    mockTransition({ order: { ...baseOrder, availableTransitions: ['CONFIRMED'] } })
    const { unmount } = render()
    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled()
    unmount()

    mockTransition({
      order: { ...baseOrder, availableTransitions: ['CONFIRMED'] },
      nextStatus: 'CONFIRMED',
      requestChange,
    })
    render()
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }))

    expect(requestChange).toHaveBeenCalledWith('CONFIRMED')
  })

  it('deshabilita el botón mientras muta', () => {
    mockTransition({
      order: { ...baseOrder, availableTransitions: ['CONFIRMED'] },
      nextStatus: 'CONFIRMED',
      isMutating: true,
    })

    render()

    expect(screen.getByRole('button', { name: 'Cambiar estado' })).toBeDisabled()
  })

  it('abre el modal de confirmación y conecta confirmar y cancelar', async () => {
    const confirmChange = vi.fn()
    const cancel = vi.fn()
    mockTransition({
      order: { ...baseOrder, availableTransitions: ['CONFIRMED'] },
      nextStatus: 'CONFIRMED',
      confirmOpen: true,
      confirmChange,
      cancel,
    })

    render()

    expect(screen.getByText('Confirmar cambio de estado')).toBeInTheDocument()
    expect(screen.getByText('¿Cambiar el pedido a Confirmado?')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(confirmChange).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(cancel).toHaveBeenCalledTimes(1)
  })
})
