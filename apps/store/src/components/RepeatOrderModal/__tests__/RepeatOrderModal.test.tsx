import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@repo/domain'
import { RepeatOrderModal } from '../index'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const order: Order = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'DELIVERED',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
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
  statusHistory: [],
  availableTransitions: [],
}

const rawCart = (items: unknown[] = []) => ({
  id: 'cart1',
  clientId: 'c1',
  status: 'OPEN',
  total: items.length > 0 ? 500 : 0,
  items,
})

const rawCartItem = {
  id: 'i1',
  productId: 'p9',
  product: { id: 'p9', name: 'Papas', price: 500 },
  quantity: 1,
  observations: null,
  optionIds: [],
  options: [],
}

const renderModal = ({
  cartItems = [],
  repeatResult,
  onClose = vi.fn(),
}: {
  cartItems?: unknown[]
  repeatResult: Record<string, unknown>
  onClose?: () => void
}) => {
  const client = createTestClient((operation) => {
    if (operation.operationName === 'MyCart') {
      return { data: { myCart: rawCart(cartItems) } }
    }
    if (operation.operationName === 'RepeatOrder') {
      return { data: { repeatOrder: repeatResult } }
    }
    return { data: {} }
  })

  return {
    client,
    onClose,
    ...renderWithProviders(
      <Routes>
        <Route path="/orders/o1" element={<RepeatOrderModal order={order} onClose={onClose} />} />
        <Route path="/cart" element={<div>Mi carrito</div>} />
      </Routes>,
      { client: client.client, route: '/orders/o1' },
    ),
  }
}

describe('RepeatOrderModal', () => {
  it('warns that the active cart will be replaced', async () => {
    renderModal({
      cartItems: [rawCartItem],
      repeatResult: { cart: rawCart(), skippedItems: [], priceChanges: [] },
    })

    expect(await screen.findByText('¿Querés repetir este pedido?')).toBeInTheDocument()
    expect(
      await screen.findByText(/Tu carrito actual tiene 1 ítem y será reemplazado/),
    ).toBeInTheDocument()
  })

  it('shows skipped products and price changes before going to the cart', async () => {
    renderModal({
      repeatResult: {
        cart: rawCart([{ ...rawCartItem, productId: 'p1' }]),
        skippedItems: [{ productId: 'p2', name: 'Postre', reason: 'PRODUCT_UNAVAILABLE' }],
        priceChanges: [
          {
            productId: 'p1',
            name: 'Burger',
            quantity: 2,
            previousUnitPrice: 1000,
            currentUnitPrice: 1100,
          },
        ],
      },
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Repetir pedido' }))

    expect(await screen.findByText('Carrito actualizado')).toBeInTheDocument()
    expect(screen.getByText('Postre')).toBeInTheDocument()
    expect(screen.getByText('No está disponible en este momento')).toBeInTheDocument()
    expect(screen.getByText('Precios actualizados')).toBeInTheDocument()
    expect(screen.getByText('2 × Burger')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ir al carrito' }))

    expect(await screen.findByText('Mi carrito')).toBeInTheDocument()
  })

  it('reports when no product could be added', async () => {
    renderModal({
      repeatResult: {
        cart: rawCart(),
        skippedItems: [{ productId: 'p2', name: 'Postre', reason: 'PRODUCT_NOT_FOUND' }],
        priceChanges: [],
      },
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Repetir pedido' }))

    expect(await screen.findByText('No se pudo generar el carrito')).toBeInTheDocument()
    expect(screen.getByText('Ya no existe en el catálogo')).toBeInTheDocument()
  })

  it('redirects automatically when everything is available and prices did not change', async () => {
    const onClose = vi.fn()
    renderModal({
      onClose,
      repeatResult: {
        cart: rawCart([rawCartItem]),
        skippedItems: [],
        priceChanges: [],
      },
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Repetir pedido' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(await screen.findByText('Mi carrito')).toBeInTheDocument()
  })
})
