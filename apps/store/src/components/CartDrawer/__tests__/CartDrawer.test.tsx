import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CartItem } from '@repo/domain'
import { CartDrawer } from '../index'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({
  useCart: vi.fn(),
}))

vi.mock('@repo/api', () => ({
  useCart: api.useCart,
  buildLeafletTileUrl: () => null,
}))

const item: CartItem = {
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
}

interface DrawerOverrides {
  cart?: { id: string; clientId: string; status: string; total: number; items: CartItem[] } | null
  isLoading?: boolean
  isMutating?: boolean
}

const setup = ({
  cart = { id: 'cart', clientId: 'c1', status: 'OPEN', total: 2300, items: [item] },
  isLoading = false,
  isMutating = false,
}: DrawerOverrides = {}) => {
  const updateItem = vi.fn().mockResolvedValue(undefined)
  const removeItem = vi.fn().mockResolvedValue(undefined)
  api.useCart.mockReturnValue({
    cart,
    isLoading,
    isMutating,
    addItem: vi.fn(),
    updateItem,
    removeItem,
  })
  return { updateItem, removeItem, ...renderWithProviders(<CartDrawer open onClose={vi.fn()} />) }
}

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the lines and links to the cart', () => {
    setup()

    expect(screen.getByText('Mi carrito')).toBeInTheDocument()
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getAllByText(/2\.300/)).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Ver carrito y confirmar' })).toBeInTheDocument()
  })

  it('updates and removes items from the drawer', async () => {
    const { updateItem, removeItem } = setup()

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))
    expect(updateItem).toHaveBeenCalledWith('i1', { quantity: 3 })

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))
    expect(removeItem).toHaveBeenCalledWith('i1')
  })

  it('shows the empty state with a catalog link', () => {
    setup({ cart: { id: 'cart', clientId: 'c1', status: 'OPEN', total: 0, items: [] } })

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toBeInTheDocument()
  })

  it('shows a loading state without lines', () => {
    setup({ cart: null, isLoading: true })

    expect(screen.queryByText('Tu carrito está vacío')).not.toBeInTheDocument()
    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
  })
})
