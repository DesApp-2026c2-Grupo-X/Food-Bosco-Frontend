import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Cart, CartItem } from '@repo/domain'
import { CartPage } from '../index'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({
  useCart: vi.fn(),
}))

vi.mock('@repo/api', () => ({
  useCart: api.useCart,
  buildLeafletTileUrl: () => null,
}))

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'i1',
  productId: 'p1',
  product: {
    id: 'p1',
    categoryId: 'c1',
    name: 'Burger',
    description: 'Rica',
    price: 1000,
    image: null,
    available: true,
    configGroups: [],
    recipe: [],
  },
  quantity: 2,
  observations: null,
  optionIds: [],
  options: [{ id: 'o1', name: 'Queso', extraPrice: 150, available: true }],
  ...overrides,
})

const cart = (items: CartItem[]): Cart => ({
  id: 'cart',
  clientId: 'c1',
  status: 'OPEN',
  total: items.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0),
  items,
})

interface CartOverrides {
  cart?: Cart | null
  isLoading?: boolean
  isMutating?: boolean
}

const setup = ({
  cart: cartValue = cart([item()]),
  isLoading = false,
  isMutating = false,
}: CartOverrides = {}) => {
  const updateItem = vi.fn().mockResolvedValue(undefined)
  const removeItem = vi.fn().mockResolvedValue(undefined)
  api.useCart.mockReturnValue({
    cart: cartValue,
    isLoading,
    isMutating,
    addItem: vi.fn(),
    updateItem,
    removeItem,
  })
  return { updateItem, removeItem, ...renderWithProviders(<CartPage />) }
}

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the empty state when there are no lines', () => {
    setup({ cart: cart([]) })

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toBeInTheDocument()
  })

  it('renders the lines and the total', () => {
    setup()

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText(/1\.150 c\/u/)).toBeInTheDocument()
    expect(screen.getByText(/2\.300/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continuar con el pedido' })).toBeInTheDocument()
  })

  it('updates the quantity through the stepper', async () => {
    const { updateItem } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))

    await waitFor(() => expect(updateItem).toHaveBeenCalledWith('i1', { quantity: 3 }))
  })

  it('removes a line', async () => {
    const { removeItem } = setup()

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))

    await waitFor(() => expect(removeItem).toHaveBeenCalledWith('i1'))
  })

  it('disables the line controls while a mutation is in flight', () => {
    setup({ isMutating: true })

    expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Eliminar/ })).toBeDisabled()
  })

  it('does not show content while loading', () => {
    setup({ cart: null, isLoading: true })

    expect(screen.queryByText('Tu carrito está vacío')).not.toBeInTheDocument()
    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
  })
})
