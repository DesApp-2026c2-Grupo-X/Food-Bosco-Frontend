import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup({ pointerEventsCheck: 0 })
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RequireAuth } from '@repo/components'
import { useAuthStore } from '@repo/api'
import { RequireAddress } from '../components/RequireAddress'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrdersPage } from '../pages/OrdersPage'
import { OrderDetailPage } from '../pages/OrderDetailPage'
import { routes } from '../routes'
import { useAddressStore } from '../stores/addressStore'
import { createTestClient, operationVariables, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const { notifyError, notifySuccess } = vi.hoisted(() => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}))

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return {
    ...actual,
    notifyError,
    notifySuccess,
    InteractiveMap: ({
      markers,
      alt,
      legend,
    }: {
      markers: unknown[]
      alt?: string
      legend?: ReactNode
    }) => (
      <div data-testid="tracking-map" aria-label={alt}>
        <div data-testid="map-legend">{legend}</div>
        {markers.map((_marker, index) => (
          <span key={index} data-testid={`marker-${index}`} />
        ))}
      </div>
    ),
  }
})

interface RawOption {
  id: string
  name: string
  extraPrice: number
  available: boolean
}

interface RawConfigGroup {
  id: string
  name: string
  type: string
  required: boolean
  min: number
  max: number
  options: RawOption[]
}

interface RawProduct {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string | null
  available: boolean
  configGroups: RawConfigGroup[]
  recipe: unknown[]
}

interface RawCartItem {
  id: string
  productId: string
  product: RawProduct
  quantity: number
  observations: string | null
  optionIds: string[]
  options: RawOption[]
}

interface RawAddress {
  id: string
  label: string
  text: string
  city: string
  postalCode: string
  latitude: number
  longitude: number
  active: boolean
}

const PRODUCTS: RawProduct[] = [
  {
    id: 'p1',
    categoryId: 'c1',
    name: 'Hamburguesa',
    description: 'Pan, carne y cheddar',
    price: 1000,
    image: null,
    available: true,
    configGroups: [
      {
        id: 'g1',
        name: 'Tamaño',
        type: 'SINGLE',
        required: true,
        min: 1,
        max: 1,
        options: [
          { id: 'o1', name: 'Grande', extraPrice: 200, available: true },
          { id: 'o4', name: 'Chica', extraPrice: 50, available: true },
        ],
      },
      {
        id: 'g2',
        name: 'Extras',
        type: 'MULTIPLE',
        required: false,
        min: 0,
        max: 3,
        options: [{ id: 'o2', name: 'Queso', extraPrice: 150, available: true }],
      },
    ],
    recipe: [],
  },
]

const CATEGORIES = [{ id: 'c1', name: 'Comida', active: true }]

const BRANCHES = [
  {
    id: 'b1',
    name: 'Centro',
    addressText: 'Av. Central 100',
    latitude: -34.6,
    longitude: -58.4,
    phone: null,
    active: true,
    hours: [],
  },
]

const ADDRESSES: RawAddress[] = [
  {
    id: 'a1',
    label: 'Casa',
    text: 'Av. Siempreviva 742',
    city: 'CABA',
    postalCode: '1425',
    latitude: -34.6,
    longitude: -58.4,
    active: true,
  },
]

const CUSTOMER = {
  id: 'u1',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '123',
  role: 'CUSTOMER',
  active: true,
}

interface BackendState {
  cartItems: RawCartItem[]
  orders: Record<string, unknown>[]
  nextOrderNumber: number
}

const productById = (id: string): RawProduct =>
  PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0]

const optionById = (product: RawProduct, id: string): RawOption | undefined =>
  product.configGroups.flatMap((group) => group.options).find((option) => option.id === id)

const itemUnitPrice = (item: RawCartItem): number =>
  item.product.price + item.options.reduce((sum, option) => sum + option.extraPrice, 0)

const itemSubtotal = (item: RawCartItem): number => itemUnitPrice(item) * item.quantity

const buildCart = (state: BackendState) => ({
  id: 'cart',
  clientId: 'u1',
  status: 'OPEN',
  total: state.cartItems.reduce((sum, item) => sum + itemSubtotal(item), 0),
  items: state.cartItems,
})

const buildOrder = (state: BackendState, address: RawAddress) => {
  const items = state.cartItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    unitPrice: itemUnitPrice(item),
    quantity: item.quantity,
    observations: item.observations,
    subtotal: itemSubtotal(item),
    options: item.options.map((option) => ({
      optionId: option.id,
      name: option.name,
      extraPrice: option.extraPrice,
    })),
  }))
  const order = {
    id: `ord-${state.orders.length + 1}`,
    number: String(state.nextOrderNumber),
    clientId: 'u1',
    branchId: 'b1',
    branch: BRANCHES[0],
    client: CUSTOMER,
    deliveryAddress: {
      text: address.text,
      latitude: address.latitude,
      longitude: address.longitude,
    },
    status: 'PREPARING',
    total: state.cartItems.reduce((sum, item) => sum + itemSubtotal(item), 0),
    estimatedDeliveryAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: '2025-01-01T10:00:00.000Z',
    items,
    statusHistory: [
      {
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        changedAt: '2025-01-01T10:05:00.000Z',
      },
    ],
    availableTransitions: [],
  }
  state.orders.push(order)
  state.cartItems = []
  state.nextOrderNumber += 1
  return order
}

const makeCartItem = (quantity = 2): RawCartItem => ({
  id: 'ci-1',
  productId: 'p1',
  product: PRODUCTS[0],
  quantity,
  observations: null,
  optionIds: ['o1'],
  options: [PRODUCTS[0].configGroups[0].options[0]],
})

const buildClient = (
  options: { addCartItemError?: boolean; cartItems?: RawCartItem[] } = {},
): TestApolloClient => {
  const state: BackendState = {
    cartItems: options.cartItems ? [...options.cartItems] : [],
    orders: [],
    nextOrderNumber: 1001,
  }

  return createTestClient((operation) => {
    const variables = operation.variables as Record<string, unknown>
    switch (operation.operationName) {
      case 'Categories':
        return { data: { categories: CATEGORIES } }
      case 'Products':
        return { data: { products: PRODUCTS } }
      case 'AvailableBranches':
        return { data: { availableBranches: BRANCHES } }
      case 'MyAddresses':
        return { data: { myAddresses: ADDRESSES } }
      case 'Product':
        return {
          data: { product: PRODUCTS.find((product) => product.id === variables.id) ?? null },
        }
      case 'MyCart':
        return { data: { myCart: buildCart(state) } }
      case 'AddCartItem': {
        if (options.addCartItemError) return new Error('add failed')
        const input = variables.input as {
          productId: string
          quantity: number
          observations?: string | null
          optionIds?: string[]
        }
        const product = productById(input.productId)
        const optionIds = input.optionIds ?? []
        state.cartItems.push({
          id: `ci-${state.cartItems.length + 1}`,
          productId: input.productId,
          product,
          quantity: input.quantity,
          observations: input.observations ?? null,
          optionIds,
          options: optionIds
            .map((id) => optionById(product, id))
            .filter((option): option is RawOption => option !== undefined),
        })
        return { data: { addCartItem: buildCart(state) } }
      }
      case 'UpdateCartItem': {
        const input = variables.input as { quantity: number }
        state.cartItems = state.cartItems.map((item) =>
          item.id === variables.itemId ? { ...item, quantity: input.quantity } : item,
        )
        return { data: { updateCartItem: buildCart(state) } }
      }
      case 'RemoveCartItem':
        state.cartItems = state.cartItems.filter((item) => item.id !== variables.itemId)
        return { data: { removeCartItem: buildCart(state) } }
      case 'CreateOrder': {
        const address = ADDRESSES.find((entry) => entry.id === variables.addressId) ?? ADDRESSES[0]
        return { data: { createOrder: buildOrder(state, address) } }
      }
      case 'MyOrders':
        return { data: { myOrders: state.orders } }
      case 'Order':
        return {
          data: {
            order: state.orders.find((order) => order.id === variables.id) ?? null,
          },
        }
      default:
        return { data: {} }
    }
  })
}

const flowTree = (
  <Routes>
    <Route element={<RequireAuth loginPath="/login" />}>
      <Route path={routes.home} element={<div>Home probe</div>} />
      <Route element={<RequireAddress redirectPath={routes.home} />}>
        <Route path={routes.catalog} element={<CatalogPage />} />
        <Route path={routes.product} element={<ProductDetailPage />} />
        <Route path={routes.cart} element={<CartPage />} />
        <Route path={routes.checkout} element={<CheckoutPage />} />
        <Route path={routes.orders} element={<OrdersPage />} />
        <Route path={routes.orderDetail} element={<OrderDetailPage />} />
      </Route>
    </Route>
    <Route path="/login" element={<div>Login probe</div>} />
  </Routes>
)

const renderFlow = (
  route: string,
  options: { addCartItemError?: boolean } = {},
  client = buildClient(options),
) => ({
  client,
  ...renderWithProviders(flowTree, { client: client.client, route }),
})

describe('purchase flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'ana@example.com',
        role: 'customer',
        firstName: 'Ana',
        lastName: 'Perez',
        phone: '123',
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      bypassAuth: false,
    })
    useAddressStore.setState({ selectedAddressId: 'a1' })
  })

  it('completes the purchase flow from catalog to order tracking', async () => {
    const { client } = renderFlow(routes.catalog)

    await user.click(await screen.findByRole('link', { name: 'Ver Hamburguesa' }))

    expect(await screen.findByRole('button', { name: /Grande/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Grande/ }))
    await user.click(screen.getByRole('button', { name: 'Agregar uno' }))
    expect(screen.getByText(/2\.400/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(await screen.findByText('Mi carrito')).toBeInTheDocument()
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument()
    expect(screen.getByText(/1\.200 c\/u/)).toBeInTheDocument()
    expect(screen.getAllByText(/2\.400/).length).toBeGreaterThan(0)
    expect(operationVariables(client.lastRequest('AddCartItem'))).toEqual({
      input: { productId: 'p1', quantity: 2, observations: null, optionIds: ['o1'] },
    })

    await user.click(screen.getByRole('link', { name: 'Continuar con el pedido' }))

    const confirm = await screen.findByRole('button', { name: 'Confirmar pedido' })
    expect(confirm).toBeEnabled()
    expect(screen.getByText('2 × Hamburguesa')).toBeInTheDocument()

    await user.click(confirm)

    expect(await screen.findByText('¡Pedido confirmado!')).toBeInTheDocument()
    expect(screen.getByText('Pedido #1001')).toBeInTheDocument()
    expect(operationVariables(client.lastRequest('CreateOrder'))).toEqual({ addressId: 'a1' })

    await user.click(screen.getByRole('link', { name: 'Ver mis pedidos' }))

    expect(await screen.findByText('Pedido #1001')).toBeInTheDocument()
    expect(screen.getByText('En preparación')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Ver seguimiento' }))

    expect(await screen.findByText('Estado del pedido')).toBeInTheDocument()
    expect(screen.getByText('Pedido #1001')).toBeInTheDocument()
    expect(screen.getByText('En preparación')).toBeInTheDocument()
    expect(screen.getByText('Preparando')).toBeInTheDocument()
    expect(screen.getByText('2 × Hamburguesa')).toBeInTheDocument()
    expect(screen.getByText('Grande')).toBeInTheDocument()
    expect(screen.getAllByText(/Av\. Siempreviva 742/).length).toBeGreaterThan(0)
  })

  it('guards the checkout when the cart is empty', async () => {
    renderFlow(routes.checkout)

    expect(await screen.findByText('Nada para confirmar')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument()
  })

  it('keeps confirmation disabled when there is no selected address', async () => {
    useAddressStore.setState({ selectedAddressId: null })
    const client = buildClient({ cartItems: [makeCartItem()] })

    renderWithProviders(
      <Routes>
        <Route path={routes.checkout} element={<CheckoutPage />} />
      </Routes>,
      { client: client.client, route: routes.checkout },
    )

    const button = await screen.findByRole('button', { name: 'Confirmar pedido' })
    expect(button).toBeDisabled()

    useAddressStore.setState({ selectedAddressId: 'a1' })
    await waitFor(() => expect(button).toBeEnabled())
    expect(screen.queryByText('¡Pedido confirmado!')).not.toBeInTheDocument()
  })

  it('shows an error and stays on the product page when AddCartItem fails', async () => {
    renderFlow(routes.product.replace(':productId', 'p1'), { addCartItemError: true })

    await screen.findByRole('button', { name: /Grande/ })
    await user.click(screen.getByRole('button', { name: /Grande/ }))
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(
      await screen.findByText('No pudimos agregar el producto. Intentá de nuevo.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Mi carrito')).not.toBeInTheDocument()
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument()
    expect(notifyError).toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  it('redirects a deep-link to a guarded route when there is no address', async () => {
    useAddressStore.setState({ selectedAddressId: null })

    renderFlow(routes.catalog)

    expect(await screen.findByText('Home probe')).toBeInTheDocument()
    expect(screen.queryByText('Catálogo')).not.toBeInTheDocument()
  })
})
