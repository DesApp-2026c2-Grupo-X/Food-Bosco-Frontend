import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CustomerReportsOverview } from '@repo/domain'
import { formatPrice } from '@repo/domain'
import { useCustomerReports } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ActivityPage } from '../index'

vi.mock('@repo/api', () => ({
  useCustomerReports: vi.fn(),
}))

const overview: CustomerReportsOverview = {
  period: { from: '2025-11-01T00:00:00.000Z', to: '2026-10-01T23:59:59.999Z' },
  summary: {
    totalOrders: 6,
    completedOrders: 4,
    cancelledOrders: 1,
    activeOrders: 1,
    totalSpent: 7200,
    averageTicket: 1800,
    favoriteBranch: {
      branchId: 'b1',
      branchName: 'Centro',
      orders: 3,
      totalSpent: 5400,
    },
  },
  activitySeries: [
    { bucket: '2026-09', orders: 4, completedOrders: 3, totalSpent: 5400 },
    { bucket: '2026-10', orders: 2, completedOrders: 1, totalSpent: 1800 },
  ],
  frequentProducts: [
    { productId: 'p1', name: 'Hamburguesa', quantity: 5, orders: 3, totalSpent: 5000 },
  ],
  ordersByStatus: [
    { status: 'DELIVERED', count: 4 },
    { status: 'CANCELLED', count: 1 },
    { status: 'PENDING', count: 1 },
  ],
}

const mockReports = (value: Partial<ReturnType<typeof useCustomerReports>> = {}) =>
  vi.mocked(useCustomerReports).mockReturnValue({
    overview,
    isLoading: false,
    error: false,
    refetch: vi.fn(),
    ...value,
  } as ReturnType<typeof useCustomerReports>)

const emptyOverview: CustomerReportsOverview = {
  period: overview.period,
  summary: {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    averageTicket: 0,
    favoriteBranch: null,
  },
  activitySeries: [],
  frequentProducts: [],
  ordersByStatus: [],
}

describe('ActivityPage', () => {
  it('muestra el resumen de compras del cliente', () => {
    mockReports()

    renderWithProviders(<ActivityPage />)

    expect(screen.getByText('Mi actividad')).toBeInTheDocument()
    expect(screen.getByText('Compras completadas')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(formatPrice(7200).replace(/\s/g, ' '))).toBeInTheDocument()
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver historial completo' })).toHaveAttribute(
      'href',
      '/orders',
    )
  })

  it('muestra el estado vacío cuando el cliente no tiene pedidos', () => {
    mockReports({ overview: emptyOverview })

    renderWithProviders(<ActivityPage />)

    expect(screen.getByText('Todavía no tenés actividad')).toBeInTheDocument()
    expect(screen.queryByText('Compras completadas')).not.toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', async () => {
    const refetch = vi.fn()
    mockReports({ overview: null, error: true, refetch })

    renderWithProviders(<ActivityPage />)

    expect(screen.getByText('No pudimos cargar tu actividad')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('no muestra el estado vacío mientras carga', () => {
    mockReports({ overview: null, isLoading: true })

    renderWithProviders(<ActivityPage />)

    expect(screen.getByText('Mi actividad')).toBeInTheDocument()
    expect(screen.queryByText('Todavía no tenés actividad')).not.toBeInTheDocument()
  })

  it('cambia el período consultado al elegir otro preset', async () => {
    mockReports()

    renderWithProviders(<ActivityPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Este mes' }))

    const lastCall = vi.mocked(useCustomerReports).mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({ groupBy: 'DAY' })
  })
})
