import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Branch, Order, Product } from '@repo/domain'
import { HomePage } from '../HomePage'
import { OrdersPage } from '../OrdersPage'
import { OrderDetailPage } from '../OrderDetailPage'
import { ProfilePage } from '../ProfilePage'
import { SucursalesPage } from '../SucursalesPage'
import { CatalogPage } from '../CatalogPage'
import { ProductDetailPage } from '../ProductDetailPage'
import { renderWithProviders } from '@test/utils'

const api = vi.hoisted(() => ({
  useProfile: vi.fn(),
  useAddresses: vi.fn(),
  useAvailableBranches: vi.fn(),
  useNearbyBranches: vi.fn(),
  useCatalog: vi.fn(),
  useOrders: vi.fn(),
  useOrder: vi.fn(),
  useCart: vi.fn(),
  useProduct: vi.fn(),
}))

vi.mock('@repo/api', () => ({
  ...api,
  buildLeafletTileUrl: () => null,
}))

const auth = vi.hoisted(() => ({ logout: vi.fn() }))

vi.mock('@repo/auth', () => ({ useLogout: () => auth.logout }))

const user = {
  id: 'u1',
  email: 'ana@bosco.com',
  role: 'customer' as const,
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '+54 11 5555-1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const branch: Branch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
  ...overrides,
})

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  riderId: null,
  riderLocation: null,
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'DELIVERED',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
  ...overrides,
})

const address = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

describe('store pages smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.useProfile.mockReturnValue({ user, isLoading: false, updateProfile: vi.fn() })
    api.useAddresses.mockReturnValue({
      addresses: [address],
      isLoading: false,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    })
    api.useAvailableBranches.mockReturnValue({ branches: [], isLoading: false })
    api.useNearbyBranches.mockReturnValue({ branches: [], isLoading: false })
    api.useCatalog.mockReturnValue({ categories: [], products: [], isLoading: false })
    api.useOrders.mockReturnValue({ orders: [], isLoading: false })
    api.useOrder.mockReturnValue({ order: null, isLoading: false })
    api.useCart.mockReturnValue({
      cart: null,
      isLoading: false,
      isMutating: false,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    api.useProduct.mockReturnValue({ product: null, isLoading: false })
  })

  describe('HomePage', () => {
    it('greets the user and explains how ordering works', async () => {
      renderWithProviders(<HomePage />)

      expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
      expect(screen.getByText('Pedir es así de fácil')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Pedir ahora' })).toBeInTheDocument()
    })

    it('lists the orders in progress', async () => {
      api.useOrders.mockReturnValue({
        orders: [order({ status: 'PREPARING' })],
        isLoading: false,
      })

      renderWithProviders(<HomePage />)

      expect(await screen.findByText('Pedidos en curso')).toBeInTheDocument()
      expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    })
  })

  describe('OrdersPage', () => {
    it('shows the empty state when there are no orders', async () => {
      renderWithProviders(<OrdersPage />)

      expect(await screen.findByText('Todavía no tenés pedidos')).toBeInTheDocument()
    })

    it('separates active and past orders', async () => {
      api.useOrders.mockReturnValue({
        orders: [
          order({ id: 'o1', number: '100', status: 'DELIVERED' }),
          order({ id: 'o2', number: '101', status: 'ON_THE_WAY' }),
        ],
        isLoading: false,
      })

      renderWithProviders(<OrdersPage />)

      expect(await screen.findByText('Pedido #100')).toBeInTheDocument()
      expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    })
  })

  describe('OrderDetailPage', () => {
    const renderDetail = () =>
      renderWithProviders(
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>,
        { route: '/orders/o1' },
      )

    it('shows a not-found state when the order does not exist', async () => {
      renderDetail()

      expect(await screen.findByText('Pedido no encontrado')).toBeInTheDocument()
    })

    it('renders a delivered order', async () => {
      api.useOrder.mockReturnValue({
        order: order({
          status: 'DELIVERED',
          statusHistory: [
            {
              previousStatus: 'ON_THE_WAY',
              newStatus: 'DELIVERED',
              changedAt: '2025-01-01T11:00:00Z',
            },
          ],
        }),
        isLoading: false,
      })

      renderDetail()

      expect(await screen.findByText('Pedido #101')).toBeInTheDocument()
      expect(screen.getAllByText('Entregado').length).toBeGreaterThan(0)
      expect(screen.getByText(/Recibido el/)).toBeInTheDocument()
    })
  })

  describe('ProfilePage', () => {
    it('renders the identity, navigation and logs out', async () => {
      renderWithProviders(<ProfilePage />, { route: '/profile' })

      expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
      expect(screen.getByText('ana@bosco.com')).toBeInTheDocument()
      expect(screen.getByText('Editar perfil')).toBeInTheDocument()
      expect(screen.getByText('Mis direcciones')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

      expect(auth.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('SucursalesPage', () => {
    it('shows the empty state without branches', async () => {
      renderWithProviders(<SucursalesPage />)

      expect(await screen.findByText('Sin sucursales')).toBeInTheDocument()
    })

    it('renders the nearby branches and their status', async () => {
      api.useNearbyBranches.mockReturnValue({ branches: [branch], isLoading: false })

      renderWithProviders(<SucursalesPage />)

      expect(await screen.findByText('Centro')).toBeInTheDocument()
      expect(screen.getByText('Cerrada')).toBeInTheDocument()
      expect(screen.getByText('Hoy: Cerrada')).toBeInTheDocument()
    })
  })

  describe('CatalogPage', () => {
    it('lists available products and filters by search', async () => {
      api.useAvailableBranches.mockReturnValue({ branches: [branch], isLoading: false })
      api.useCatalog.mockReturnValue({
        categories: [{ id: 'c1', name: 'Comida', active: true }],
        products: [product()],
        isLoading: false,
      })

      renderWithProviders(<CatalogPage />)

      expect(await screen.findByText('Burger')).toBeInTheDocument()

      await userEvent.type(screen.getByPlaceholderText('Buscar por nombre...'), 'zzz')

      await waitFor(() => expect(screen.getByText('No encontramos nada')).toBeInTheDocument())
      expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    })

    it('shows the unavailable-branch state', async () => {
      renderWithProviders(<CatalogPage />)

      expect(await screen.findByText('No hay sucursales disponibles')).toBeInTheDocument()
    })
  })

  describe('ProductDetailPage', () => {
    const renderDetail = () =>
      renderWithProviders(
        <Routes>
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Routes>,
        { route: '/products/p1' },
      )

    it('shows a not-found state for a missing product', async () => {
      renderDetail()

      expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
    })

    it('requires mandatory options before adding to the cart', async () => {
      api.useProduct.mockReturnValue({
        product: product({
          configGroups: [
            {
              id: 'g1',
              name: 'Tamaño',
              type: 'single',
              required: true,
              min: 1,
              max: 1,
              options: [{ id: 'o1', name: 'Grande', extraPrice: 0, available: true }],
            },
          ],
        }),
        isLoading: false,
      })

      renderDetail()

      expect(await screen.findByText('Burger')).toBeInTheDocument()
      expect(
        screen.getByText('Seleccioná las opciones obligatorias para continuar.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeDisabled()

      await userEvent.click(screen.getByRole('button', { name: /Grande/ }))

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeEnabled(),
      )
    })
  })
})
