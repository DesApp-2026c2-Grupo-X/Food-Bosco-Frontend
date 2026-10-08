import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@repo/api'
import type { User } from '@repo/domain'
import { HomePage } from '../index'
import { useAddressStore } from '../../../stores/addressStore'
import { createTestClient, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'

const user: User = {
  id: 'u1',
  email: 'ana@bosco.com',
  role: 'customer',
  firstName: 'Ana',
  lastName: 'Pérez',
  phone: '+54 11 5555-1234',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Central 100',
  latitude: -34.6,
  longitude: -58.4,
  phone: null,
  active: true,
  hours: [],
}

const rawProduct = (index: number) => ({
  id: `p${index}`,
  categoryId: 'c1',
  name: `Producto ${index}`,
  description: 'Rico',
  price: 1000 + index,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
})

const categories = [
  { id: 'c1', name: 'Comida', active: true },
  { id: 'c2', name: 'Bebidas', active: true },
]

const activeOrder = {
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  branch: null,
  deliveryAddress: { text: 'Calle 1', latitude: -34.6, longitude: -58.4 },
  status: 'PREPARING',
  total: 2300,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  items: [],
  statusHistory: [],
  availableTransitions: [],
}

const buildClient = ({
  branches = [rawBranch],
  products = Array.from({ length: 9 }, (_, index) => rawProduct(index + 1)),
  orders = [] as unknown[],
}: {
  branches?: unknown[]
  products?: unknown[]
  orders?: unknown[]
} = {}): TestApolloClient =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'AvailableBranches':
        return { data: { availableBranches: branches } }
      case 'Categories':
        return { data: { categories } }
      case 'Products':
        return { data: { products } }
      case 'MyOrders':
        return { data: { myOrders: orders } }
      default:
        return { data: {} }
    }
  })

const CatalogProbe = () => {
  const { search } = useLocation()
  return <div data-testid="catalog-route">{search}</div>
}

const renderHome = (client: TestApolloClient, route = '/') =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogProbe />} />
    </Routes>,
    { client: client.client, route },
  )

describe('HomePage', () => {
  beforeEach(() => {
    useAddressStore.setState({ selectedAddressId: 'a1' })
    useAuthStore.setState({ user, accessToken: null })
  })

  it('greets the user and shows a catalog preview when a branch is available', async () => {
    renderHome(buildClient())

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
    expect(await screen.findByText('Explorá por categoría')).toBeInTheDocument()
    expect(screen.getByText('Los más pedidos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comida' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument()
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 8')).toBeInTheDocument()
    expect(screen.queryByText('Producto 9')).not.toBeInTheDocument()
  })

  it('navigates to the catalog filtered by the chosen category', async () => {
    renderHome(buildClient())
    await screen.findByText('Explorá por categoría')

    await userEvent.click(screen.getByRole('button', { name: 'Comida' }))

    expect(await screen.findByTestId('catalog-route')).toHaveTextContent('?cat=c1')
  })

  it('does not render the catalog preview without an available branch', async () => {
    renderHome(buildClient({ branches: [] }))

    expect(await screen.findByText('¡Hola, Ana!')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Explorá por categoría')).not.toBeInTheDocument())
    expect(screen.queryByText('Los más pedidos')).not.toBeInTheDocument()
  })

  it('falls back to the generic hero title when the user has no name', async () => {
    useAuthStore.setState({ user: null, accessToken: null })

    renderHome(buildClient())

    expect(await screen.findByText('¿Qué tenés ganas de comer hoy?')).toBeInTheDocument()
    expect(screen.queryByText(/¡Hola,/)).not.toBeInTheDocument()
  })

  it('lists the orders in progress', async () => {
    renderHome(buildClient({ orders: [activeOrder] }))

    expect(await screen.findByText('Pedidos en curso')).toBeInTheDocument()
    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
  })

  it('exposes the main calls to action', async () => {
    renderHome(buildClient())
    await screen.findByText('¡Hola, Ana!')

    expect(screen.getByRole('link', { name: 'Pedir ahora' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'Ver sucursales' })).toHaveAttribute(
      'href',
      '/branches',
    )
    expect(screen.getByRole('link', { name: 'Conocer sucursales' })).toHaveAttribute(
      'href',
      '/branches',
    )
    expect(screen.getByRole('link', { name: 'Ver todo' })).toHaveAttribute('href', '/catalog')
    expect(screen.getByRole('link', { name: 'Ver todo el catálogo' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
