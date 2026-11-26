import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { BranchRatingRow, CourierRatingRow, ReviewsSummary } from '@repo/domain'
import { useBranchRatingRanking, useCourierRatingRanking, useReviewsSummary } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { RatingsPage } from '../index'

vi.mock('@repo/api', () => ({
  getApiErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Error al cargar'),
  useReviewsSummary: vi.fn(),
  useBranchRatingRanking: vi.fn(),
  useCourierRatingRanking: vi.fn(),
}))

const summary: ReviewsSummary = {
  branchAverageRating: 3.9,
  branchReviews: 141,
  courierAverageRating: 4.2,
  courierReviews: 132,
}

const branchRows: BranchRatingRow[] = [
  {
    branchId: 'b1',
    branch: {
      id: 'b1',
      name: 'Norte',
      addressText: 'Av. Principal 100',
      latitude: -34.6,
      longitude: -58.6,
      active: true,
    },
    averageRating: 4.4,
    totalReviews: 16,
  },
  {
    branchId: 'b2',
    branch: {
      id: 'b2',
      name: 'Oeste',
      addressText: 'Av. Oeste 200',
      latitude: -34.6,
      longitude: -58.7,
      active: true,
    },
    averageRating: 4.0,
    totalReviews: 44,
  },
]

const courierRows: CourierRatingRow[] = [
  {
    courierId: 'c1',
    rider: { id: 'c1', firstName: 'Lucía', lastName: 'Giménez' },
    averageRating: 4.3,
    totalReviews: 21,
  },
  {
    courierId: 'c2',
    rider: { id: 'c2', firstName: 'Diego', lastName: 'Fernández' },
    averageRating: 3.5,
    totalReviews: 19,
  },
]

const mockSummary = (overrides: Partial<ReturnType<typeof useReviewsSummary>> = {}) =>
  vi.mocked(useReviewsSummary).mockReturnValue({
    summary,
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useReviewsSummary>)

const mockBranchRanking = (overrides: Partial<ReturnType<typeof useBranchRatingRanking>> = {}) =>
  vi.mocked(useBranchRatingRanking).mockReturnValue({
    rows: branchRows,
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useBranchRatingRanking>)

const mockCourierRanking = (overrides: Partial<ReturnType<typeof useCourierRatingRanking>> = {}) =>
  vi.mocked(useCourierRatingRanking).mockReturnValue({
    rows: courierRows,
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCourierRatingRanking>)

describe('RatingsPage (admin)', () => {
  it('muestra KPIs, rankings completos y medias estrellas en promedios fraccionarios', () => {
    mockSummary()
    mockBranchRanking()
    mockCourierRanking()

    renderWithProviders(<RatingsPage />)

    expect(screen.getByText('Calificaciones')).toBeInTheDocument()
    expect(screen.getByText('Promedio de sucursales')).toBeInTheDocument()
    expect(screen.getByText('3.9 ★')).toBeInTheDocument()
    expect(screen.getByText('141')).toBeInTheDocument()
    expect(screen.getByText('4.2 ★')).toBeInTheDocument()
    expect(screen.getByText('132')).toBeInTheDocument()

    expect(screen.getByText('Norte')).toBeInTheDocument()
    expect(screen.getByText('Oeste')).toBeInTheDocument()
    expect(screen.getByText('Lucía Giménez')).toBeInTheDocument()
    expect(screen.getByText('Diego Fernández')).toBeInTheDocument()

    const norteStars = screen.getByRole('img', { name: 'Promedio de Norte: 4.4 de 5 estrellas' })
    expect(
      Array.from(norteStars.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'half'])

    const oesteStars = screen.getByRole('img', { name: 'Promedio de Oeste: 4 de 5 estrellas' })
    expect(
      Array.from(oesteStars.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'empty'])

    const diegoStars = screen.getByRole('img', {
      name: 'Promedio de Diego Fernández: 3.5 de 5 estrellas',
    })
    expect(
      Array.from(diegoStars.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'half', 'empty'])
  })

  it('muestra alerta de error cuando falla el resumen', () => {
    mockSummary({ summary: null, error: new Error('Fallo de red') as never })
    mockBranchRanking({ rows: [] })
    mockCourierRanking({ rows: [] })

    renderWithProviders(<RatingsPage />)

    expect(screen.getByText('Fallo de red')).toBeInTheDocument()
  })

  it('muestra estados vacíos cuando no hay calificaciones en el período', () => {
    mockSummary()
    mockBranchRanking({ rows: [] })
    mockCourierRanking({ rows: [] })

    renderWithProviders(<RatingsPage />)

    expect(
      screen.getByText('Todavía no hay sucursales calificadas en el período.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Todavía no hay repartidores calificados en el período.'),
    ).toBeInTheDocument()
  })
})
