import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { App } from '../App'

const branchAdmin: User = {
  id: 'branch-admin-1',
  email: 'julian.sosa@foodbosco.com',
  role: 'branch_admin',
  firstName: 'Julián',
  lastName: 'Sosa',
  phone: '+54 11 5555 1234',
  active: true,
  createdAt: '2025-01-15T09:00:00',
  branchId: 'b1',
}

const customer: User = { ...branchAdmin, role: 'customer' }

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Siempreviva 742',
  latitude: 0,
  longitude: 0,
  phone: null,
  active: true,
  hours: [],
}

const emptyOverview = {
  period: {},
  kpis: {},
  variation: {},
  salesSeries: [],
  ordersByStatus: [],
  topProducts: [],
  branchPerformance: [],
}

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'Branch':
        return { data: { branch: rawBranch } }
      case 'AdminOrders':
        return { data: { orders: [] } }
      case 'BranchProducts':
        return { data: { branchProducts: [] } }
      case 'AdminBranchStock':
        return { data: { branchStock: [] } }
      case 'ReportsOverview':
        return { data: { reportsOverview: emptyOverview } }
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

  it('blocks users without the branch_admin role', async () => {
    useAuthStore.setState({ user: customer })
    renderApp('/')

    expect(await screen.findByText('Ingresá a tu cuenta')).toBeInTheDocument()
  })

  it('renders the branch layout and home page for a branch_admin', async () => {
    useAuthStore.setState({ user: branchAdmin })
    renderApp('/')

    expect(await screen.findByText('Gestioná la operación de tu sucursal.')).toBeInTheDocument()
    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
  })

  it.each([
    ['/orders', 'Consultá y operá los pedidos de tu sucursal.'],
    ['/products', 'Activá o pausá lo que se vende en tu sucursal.'],
    ['/stock', 'Controlá el inventario de ingredientes de tu sucursal.'],
    ['/reports/products', 'Métricas de tu sucursal.'],
    ['/profile', 'Datos del empleado con sesión iniciada.'],
  ])('maps %s to its page', async (route, description) => {
    useAuthStore.setState({ user: branchAdmin })
    renderApp(route)

    expect(await screen.findByText(description)).toBeInTheDocument()
  })

  it('does not render the app for an unknown path', async () => {
    useAuthStore.setState({ user: branchAdmin })
    renderApp('/does-not-exist')

    expect(screen.queryByText('Sucursal Centro')).not.toBeInTheDocument()
    expect(screen.queryByText('Gestioná la operación de tu sucursal.')).not.toBeInTheDocument()
    expect(screen.queryByText('Ingresá a tu cuenta')).not.toBeInTheDocument()
  })
})
