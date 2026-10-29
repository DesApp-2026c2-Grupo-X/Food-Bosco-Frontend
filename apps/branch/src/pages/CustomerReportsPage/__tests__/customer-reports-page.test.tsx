import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CustomerInsightsOverview } from '@repo/domain'
import { useCustomerInsights, useCustomerRegistrationStats } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { CustomerReportsPage } from '../index'

vi.mock('@repo/api', () => ({
  useCustomerInsights: vi.fn(),
  useCustomerRegistrationStats: vi.fn(),
}))

const overview: CustomerInsightsOverview = {
  period: { from: '2026-10-01T00:00:00.000Z', to: '2026-10-31T23:59:59.999Z' },
  kpis: {
    totalBuyers: 1,
    newBuyers: 1,
    returningBuyers: 0,
    recurringBuyers: 0,
    totalOrders: 1,
    totalSpent: 250,
    averageTicket: 250,
    averageOrdersPerBuyer: 1,
  },
  buyerSeries: [{ bucket: '2026-10', buyers: 1 }],
  frequency: [{ bucket: '1', label: '1 pedido', buyers: 1 }],
  recency: [{ bucket: '0-7', label: 'Últimos 7 días', buyers: 1 }],
  branchActivity: [{ branchId: 'b1', branchName: 'Centro', buyers: 1, orders: 1, totalSpent: 250 }],
  customers: [
    {
      clientId: 'c1',
      client: {
        id: 'c1',
        email: 'ana@example.com',
        firstName: 'Ana',
        lastName: 'Gomez',
        phone: '11223344',
        role: 'customer',
        active: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      orders: 1,
      totalSpent: 250,
      firstPurchaseAt: '2026-10-02T00:00:00.000Z',
      lastPurchaseAt: '2026-10-20T00:00:00.000Z',
      daysSinceLastPurchase: 5,
      isNew: true,
      isNewOnPlatform: false,
      isRecurring: false,
    },
  ],
}

const mockInsights = (overrides: Partial<ReturnType<typeof useCustomerInsights>> = {}) =>
  vi.mocked(useCustomerInsights).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCustomerInsights>)

const mockRegistrationStats = () =>
  vi.mocked(useCustomerRegistrationStats).mockReturnValue({
    stats: null,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useCustomerRegistrationStats>)

describe('CustomerReportsPage (branch)', () => {
  it('muestra los indicadores de la sucursal y su listado de clientes', () => {
    mockInsights()
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(screen.getByText('Reportes de clientes')).toBeInTheDocument()
    expect(screen.getByText('Clientes compradores')).toBeInTheDocument()
    expect(screen.getByText('Ana Gomez')).toBeInTheDocument()
    expect(screen.getByText('Nuevo en la sucursal')).toBeInTheDocument()
  })

  it('no consulta registros globales ni ofrece filtro de sucursal', () => {
    mockInsights()
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(useCustomerRegistrationStats).toHaveBeenCalledWith(expect.anything(), { skip: true })
    expect(screen.queryByText('Clientes registrados')).not.toBeInTheDocument()
    expect(screen.queryByText('Sucursal')).not.toBeInTheDocument()
  })

  it('muestra el estado de error cuando falla la consulta', () => {
    mockInsights({ error: true, overview: null })
    mockRegistrationStats()

    renderWithProviders(<CustomerReportsPage />)

    expect(screen.getByText('Error de consulta')).toBeInTheDocument()
  })
})
