import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminBranch, CustomerInsightsOverview } from '@repo/domain'
import { useBranches, useCustomerInsights, useCustomerRegistrationStats } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { CustomerReportsPage } from '../index'

vi.mock('@repo/api', () => ({
  useBranches: vi.fn(),
  useCustomerInsights: vi.fn(),
  useCustomerRegistrationStats: vi.fn(),
}))

const branch: AdminBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

const overview: CustomerInsightsOverview = {
  period: { from: '2026-10-01T00:00:00.000Z', to: '2026-10-31T23:59:59.999Z' },
  kpis: {
    totalBuyers: 2,
    newBuyers: 1,
    returningBuyers: 1,
    recurringBuyers: 1,
    totalOrders: 3,
    totalSpent: 700,
    averageTicket: 233.33,
    averageOrdersPerBuyer: 1.5,
  },
  buyerSeries: [{ bucket: '2026-10', buyers: 2 }],
  frequency: [{ bucket: '1', label: '1 pedido', buyers: 1 }],
  recency: [{ bucket: '0-7', label: 'Últimos 7 días', buyers: 2 }],
  branchActivity: [{ branchId: 'b1', branchName: 'Centro', buyers: 2, orders: 3, totalSpent: 700 }],
  customers: [
    {
      clientId: 'c1',
      client: {
        id: 'c1',
        email: 'juan@example.com',
        firstName: 'Juan',
        lastName: 'Perez',
        phone: '11223344',
        role: 'customer',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      orders: 2,
      totalSpent: 600,
      firstPurchaseAt: '2026-10-02T00:00:00.000Z',
      lastPurchaseAt: '2026-10-20T00:00:00.000Z',
      daysSinceLastPurchase: 5,
      isNew: true,
      isNewOnPlatform: true,
      isRecurring: true,
    },
  ],
}

const mockBranches = () =>
  vi.mocked(useBranches).mockReturnValue({
    branches: [branch],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

const mockInsights = (overrides: Partial<ReturnType<typeof useCustomerInsights>> = {}) =>
  vi.mocked(useCustomerInsights).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCustomerInsights>)

const mockRegistrationStats = (
  overrides: Partial<ReturnType<typeof useCustomerRegistrationStats>> = {},
) =>
  vi.mocked(useCustomerRegistrationStats).mockReturnValue({
    stats: { total: 40, newInPeriod: 5 },
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCustomerRegistrationStats>)

describe('CustomerReportsPage (admin)', () => {
  it('muestra los indicadores globales y el listado de clientes', () => {
    mockBranches()
    mockInsights()
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(screen.getByText('Reportes de clientes')).toBeInTheDocument()
    expect(screen.getByText('Clientes compradores')).toBeInTheDocument()
    expect(screen.getByText('Clientes registrados')).toBeInTheDocument()
    expect(screen.getByText('Nuevos registros')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByText('juan@example.com')).toBeInTheDocument()
  })

  it('consulta el reporte con el rango y sin sucursal por defecto', () => {
    mockBranches()
    mockInsights()
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(useCustomerInsights).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: undefined, limit: 100, sortBy: 'LAST_PURCHASE' }),
    )
  })

  it('muestra el estado de error cuando falla la consulta', () => {
    mockBranches()
    mockInsights({ error: true, overview: null })
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(screen.getByText('Error de consulta')).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay clientes compradores', () => {
    mockBranches()
    mockInsights({
      overview: {
        ...overview,
        kpis: {
          ...overview.kpis,
          totalBuyers: 0,
          newBuyers: 0,
          returningBuyers: 0,
          recurringBuyers: 0,
          totalOrders: 0,
          totalSpent: 0,
          averageTicket: 0,
          averageOrdersPerBuyer: 0,
        },
        buyerSeries: [],
        frequency: [],
        recency: [],
        branchActivity: [],
        customers: [],
      },
    })
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(screen.getByText('Sin clientes compradores')).toBeInTheDocument()
  })
})
