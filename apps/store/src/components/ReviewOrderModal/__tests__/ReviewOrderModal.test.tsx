import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { ReviewOrderModal } from '../index'
import { renderWithProviders } from '@test/utils'

const mocks = vi.hoisted(() => ({
  createReview: vi.fn(),
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('@repo/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/api')>()
  return {
    ...actual,
    useCreateOrderReview: () => ({
      createReview: mocks.createReview,
      isLoading: false,
      error: null,
      review: null,
    }),
    getApiErrorMessage: () => 'No pudimos enviar tu calificación.',
  }
})

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return {
    ...actual,
    notifySuccess: mocks.notifySuccess,
    notifyError: mocks.notifyError,
  }
})

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '000101',
  clientId: 'c1',
  riderId: 'u-rider',
  rider: { id: 'u-rider', firstName: 'Ana', lastName: 'Pérez' },
  branchId: 'b1',
  branch: {
    id: 'b1',
    name: 'Sucursal Centro',
    addressText: 'Av. 1',
    latitude: 0,
    longitude: 0,
    phone: null,
    active: true,
    hours: [],
  },
  deliveryAddress: { text: 'Calle 1', latitude: 0, longitude: 0 },
  status: 'DELIVERED',
  total: 1000,
  estimatedDeliveryAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

const star = (group: string, rating: string) =>
  within(screen.getByRole('radiogroup', { name: group })).getByRole('radio', { name: rating })

const renderModal = (orderValue: Order = order(), onClose = vi.fn(), onSubmitted = vi.fn()) =>
  renderWithProviders(
    <ReviewOrderModal
      open
      order={orderValue}
      onClose={onClose}
      onSubmitted={onSubmitted}
    />,
  )

describe('ReviewOrderModal', () => {
  it('muestra sucursal y repartidor cuando el pedido tiene delivery', () => {
    renderModal()

    expect(screen.getByText('¿Cómo estuvo tu pedido?')).toBeInTheDocument()
    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Calificación del repartidor' })).toBeInTheDocument()
  })

  it('oculta la sección del repartidor en pedidos sin delivery', () => {
    renderModal(order({ riderId: null, rider: null }))

    expect(
      screen.queryByRole('radiogroup', { name: 'Calificación del repartidor' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Calificá la entrega de tu pedido')).not.toBeInTheDocument()
  })

  it('exige la calificación de la sucursal', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Enviar calificación' })).toBeDisabled()
  })

  it('exige la calificación del repartidor cuando hay delivery', async () => {
    renderModal()

    await userEvent.click(star('Calificación de la sucursal', '5 estrellas'))

    expect(screen.getByRole('button', { name: 'Enviar calificación' })).toBeDisabled()
  })

  it('envía sucursal y repartidor con comentarios independientes', async () => {
    mocks.createReview.mockResolvedValue({ data: {} })
    const onClose = vi.fn()
    const onSubmitted = vi.fn()
    renderModal(order(), onClose, onSubmitted)

    expect(screen.getAllByRole('radiogroup')).toHaveLength(2)

    await userEvent.click(star('Calificación de la sucursal', '4 estrellas'))
    await userEvent.type(
      screen.getByLabelText('Comentario sobre la sucursal (opcional)'),
      'Muy rico',
    )
    await userEvent.click(star('Calificación del repartidor', '5 estrellas'))
    await userEvent.type(
      screen.getByLabelText('Comentario sobre el repartidor (opcional)'),
      'Llegó rápido',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Enviar calificación' }))

    await waitFor(() =>
      expect(mocks.createReview).toHaveBeenCalledWith({
        variables: {
          orderId: 'o1',
          input: {
            branchRating: 4,
            branchComment: 'Muy rico',
            courierRating: 5,
            courierComment: 'Llegó rápido',
          },
        },
      }),
    )
    expect(mocks.notifySuccess).toHaveBeenCalled()
    expect(onSubmitted).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('envía sólo la sucursal cuando el pedido no tiene delivery', async () => {
    mocks.createReview.mockResolvedValue({ data: {} })
    renderModal(order({ riderId: null, rider: null }))

    await userEvent.click(star('Calificación de la sucursal', '5 estrellas'))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar calificación' }))

    await waitFor(() =>
      expect(mocks.createReview).toHaveBeenCalledWith({
        variables: {
          orderId: 'o1',
          input: { branchRating: 5, branchComment: null },
        },
      }),
    )
  })

  it('muestra el error del backend y no cierra el modal', async () => {
    mocks.createReview.mockRejectedValue(new Error('falló'))
    const onClose = vi.fn()
    renderModal(order(), onClose)

    await userEvent.click(star('Calificación de la sucursal', '5 estrellas'))
    await userEvent.click(star('Calificación del repartidor', '5 estrellas'))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar calificación' }))

    expect(
      await screen.findByText('No pudimos enviar tu calificación.'),
    ).toBeInTheDocument()
    expect(mocks.notifyError).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('evita envíos duplicados mientras la solicitud está en curso', async () => {
    let resolve: (value: unknown) => void = () => undefined
    mocks.createReview.mockReturnValue(
      new Promise((resolver) => {
        resolve = resolver
      }),
    )
    renderModal()

    await userEvent.click(star('Calificación de la sucursal', '5 estrellas'))
    await userEvent.click(star('Calificación del repartidor', '5 estrellas'))

    const submit = screen.getByRole('button', { name: 'Enviar calificación' })
    await userEvent.click(submit)
    await userEvent.click(submit)

    expect(mocks.createReview).toHaveBeenCalledTimes(1)
    resolve({ data: {} })
  })
})
