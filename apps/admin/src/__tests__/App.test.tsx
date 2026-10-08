import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { App } from '../App'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  description: 'Rica',
  price: 1500,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

const superAdmin: User = {
  id: 'u1',
  email: 'admin@bosco.test',
  role: 'super_admin',
  firstName: 'Ada',
  lastName: 'Admin',
  phone: '11 5555 1111',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

const customer: User = { ...superAdmin, role: 'customer' }

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminProduct':
        return { data: { product: rawProduct } }
      case 'AdminProducts':
        return { data: { products: [] } }
      case 'AdminCategories':
        return { data: { categories: [] } }
      case 'AdminIngredients':
        return { data: { ingredients: [] } }
      case 'AdminBranches':
        return { data: { branches: [] } }
      case 'AdminUsers':
        return { data: { users: { data: [] } } }
      case 'AdminParameters':
        return { data: { parameters: [] } }
      case 'AdminOrders':
        return { data: { orders: [] } }
      case 'AdminBranchStock':
        return { data: { branchStock: [] } }
      case 'ReportsOverview':
        return {
          data: {
            reportsOverview: {
              period: {},
              kpis: {},
              variation: {},
              salesSeries: [],
              ordersByStatus: [],
              topProducts: [],
              branchPerformance: [],
            },
          },
        }
      case 'BestSellingProducts':
        return { data: { bestSellingProducts: [] } }
      case 'LeastSoldProducts':
        return { data: { leastSoldProducts: [] } }
      case 'OutOfStockProducts':
        return { data: { outOfStockProducts: [] } }
      case 'HighestRevenueProducts':
        return { data: { highestRevenueProducts: [] } }
      default:
        return { data: {} }
    }
  })

const renderApp = (route: string) => {
  const testClient = makeClient()
  renderWithProviders(<App />, { route, client: testClient.client })
  return testClient
}

describe('App', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      bypassAuth: false,
    })
  })

  it('redirects unauthenticated users to the login page', async () => {
    renderApp('/')

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument()
  })

  it('blocks users without the super_admin role', async () => {
    useAuthStore.setState({ user: customer })
    renderApp('/')

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument()
  })

  it('renders the admin layout and home page for a super_admin', async () => {
    useAuthStore.setState({ user: superAdmin })
    renderApp('/')

    expect(await screen.findByText('Administración central de la plataforma.')).toBeInTheDocument()
    expect(screen.getByText('Administrador global')).toBeInTheDocument()
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
  })

  it.each([
    ['/', 'Administración central de la plataforma.'],
    ['/categories', 'Definí las categorías del catálogo.'],
    ['/products', 'Administrá el catálogo global de productos.'],
    ['/branches', 'Administrá los locales físicos y sus horarios.'],
    ['/staff', 'Creá colaboradores de sucursal y admins globales.'],
    ['/parameters', 'Modificá los valores usados por las decisiones del sistema.'],
    ['/orders', 'Consultá y operá los pedidos de todas las sucursales.'],
    ['/stock', 'Controlá el inventario de ingredientes de todas las sucursales.'],
    ['/reports/products', 'Métricas consolidadas de todas las sucursales.'],
    ['/profile', 'Datos del administrador con sesión iniciada.'],
  ])('maps %s to its page', async (route, description) => {
    useAuthStore.setState({ user: superAdmin })
    renderApp(route)

    expect(await screen.findByText(description)).toBeInTheDocument()
  })

  it('renders the new product route', async () => {
    useAuthStore.setState({ user: superAdmin })
    renderApp('/products/new')

    expect(await screen.findByText('Nuevo producto')).toBeInTheDocument()
  })

  it('passes the productId param to the edit product route', async () => {
    const testClient = makeClient()
    useAuthStore.setState({ user: superAdmin })
    renderWithProviders(<App />, { route: '/products/p1/edit', client: testClient.client })

    expect(await screen.findByText('Hamburguesa Clásica')).toBeInTheDocument()
  })

  it('renders the new branch route', async () => {
    useAuthStore.setState({ user: superAdmin })
    renderApp('/branches/new')

    expect(await screen.findByText('Nueva sucursal')).toBeInTheDocument()
  })
})
