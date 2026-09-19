import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDeleteModal } from '../ConfirmDeleteModal'
import { AdjustStockModal } from '../AdjustStockModal'
import { IncomingOrderModal } from '../IncomingOrderModal'
import { renderWithProviders } from '@test/utils'
import type { BranchStock, Order } from '@repo/domain'

vi.mock('../AudioUnlock/playIncomingSound', () => ({
  playIncomingSound: vi.fn(),
  stopIncomingSound: vi.fn(),
  unlockAudio: vi.fn(),
}))

describe('ConfirmDeleteModal', () => {
  it('renders the confirmation and wires both actions', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <ConfirmDeleteModal
        open
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer."
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('¿Eliminar producto?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('uses a custom confirm label', () => {
    renderWithProviders(
      <ConfirmDeleteModal
        open
        title="Quitar"
        description="desc"
        confirmLabel="Quitar ahora"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Quitar ahora' })).toBeInTheDocument()
  })
})

const stock: BranchStock = {
  ingredientId: 'i1',
  branchId: 'b1',
  quantity: 10,
  ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
}

describe('AdjustStockModal', () => {
  it('shows the current stock and submits a positive delta', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <AdjustStockModal ingredient={stock} onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    expect(screen.getByText(/Pan · Actual: 10 un/)).toBeInTheDocument()

    const delta = screen.getByPlaceholderText('Ej: 5 o -3')
    await userEvent.type(delta, '5')
    await userEvent.tab()
    await userEvent.type(screen.getByPlaceholderText('Conteo físico, reposición…'), 'reposicion')

    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(5, 'reposicion'))
  })

  it('submits a negative adjustment', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <AdjustStockModal ingredient={stock} onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: 5 o -3'), '-3')
    await userEvent.tab()
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(-3, ''))
  })

  it('blocks a zero adjustment and shows the validation message', async () => {
    const onSubmit = vi.fn()
    renderWithProviders(
      <AdjustStockModal ingredient={stock} onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    await userEvent.type(screen.getByPlaceholderText('Ej: 5 o -3'), '0')
    await userEvent.tab()

    expect(await screen.findByText('La cantidad no puede ser 0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar ajuste' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

const order: Order = {
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
  availableTransitions: [],
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
  items: [
    {
      productId: 'p1',
      name: 'Burger',
      unitPrice: 1000,
      quantity: 2,
      observations: null,
      subtotal: 2000,
      options: [],
    },
  ],
}

describe('IncomingOrderModal', () => {
  it('summarizes the incoming order', () => {
    renderWithProviders(
      <IncomingOrderModal
        order={order}
        onClose={vi.fn()}
        orderDetailPath={(id) => `/orders/${id}`}
      />,
    )

    expect(screen.getByText('Nuevo pedido #101')).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
    expect(screen.getByText('Av. Siempreviva 742')).toBeInTheDocument()
    expect(screen.getByText(/2 ítems/)).toBeInTheDocument()
  })

  it('closes and navigates to the order detail when viewing', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <>
        <IncomingOrderModal
          order={order}
          onClose={onClose}
          orderDetailPath={(id) => `/orders/${id}`}
        />
        <Routes>
          <Route path="/orders/:id" element={<div>detalle del pedido</div>} />
        </Routes>
      </>,
      { route: '/home' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Ver pedido' }))
    expect(onClose).toHaveBeenCalled()
    expect(await screen.findByText('detalle del pedido')).toBeInTheDocument()
  })
})
