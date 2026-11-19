import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Promotion } from '@repo/domain'
import { useAdminPromotions } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { PromotionsPage } from '../index'

vi.mock('@repo/api', () => ({
  useAdminPromotions: vi.fn(),
}))

const promo1: Promotion = {
  id: 'pr1',
  name: '2x1 en Hamburguesas',
  description: 'Comprá 2 hamburguesas y pagá 1',
  active: true,
  type: 'BUY_X_GET_Y',
  discountValue: null,
  maxDiscount: null,
  buyQuantity: 2,
  payQuantity: 1,
  scope: 'CATEGORY',
  categoryIds: ['c1'],
  productIds: [],
  branchIds: [],
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  minSubtotal: 0,
  minQuantity: 0,
  code: null,
  stackable: false,
  priority: 10,
  maxUsesTotal: 100,
  maxUsesPerCustomer: 2,
  usedCount: 5,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const promo2: Promotion = {
  id: 'pr2',
  name: 'Cupón Bienvenida',
  description: 'Descuento para nuevos clientes',
  active: true,
  type: 'FIXED_AMOUNT',
  discountValue: 2000,
  maxDiscount: null,
  buyQuantity: null,
  payQuantity: null,
  scope: 'ORDER',
  categoryIds: [],
  productIds: [],
  branchIds: [],
  daysOfWeek: [],
  startTime: null,
  endTime: null,
  minSubtotal: 5000,
  minQuantity: 0,
  code: 'BIENVENIDO',
  stackable: true,
  priority: 5,
  maxUsesTotal: null,
  maxUsesPerCustomer: 1,
  usedCount: 12,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockPromotions = (overrides: Partial<ReturnType<typeof useAdminPromotions>> = {}) =>
  vi.mocked(useAdminPromotions).mockReturnValue({
    promotions: [promo1, promo2],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminPromotions>)

describe('PromotionsPage', () => {
  it('renders promotions list with details and coupon badges', () => {
    mockPromotions()

    renderWithProviders(<PromotionsPage />)

    expect(screen.getByText('2x1 en Hamburguesas')).toBeInTheDocument()
    expect(screen.getByText('Cupón Bienvenida')).toBeInTheDocument()
    expect(screen.getByText('BIENVENIDO')).toBeInTheDocument()
    expect(screen.getByText('2x1')).toBeInTheDocument()
  })

  it('shows empty state when no promotions match', () => {
    mockPromotions({ promotions: [] })

    renderWithProviders(<PromotionsPage />)

    expect(screen.getByText('Sin promociones')).toBeInTheDocument()
  })

  it('navigates to the new promotion page', async () => {
    mockPromotions()

    renderWithProviders(
      <Routes>
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/promotions/new" element={<div>Nueva promoción page</div>} />
      </Routes>,
      { route: '/promotions' },
    )

    await userEvent.click(screen.getByRole('button', { name: 'Nueva promoción' }))

    expect(screen.getByText('Nueva promoción page')).toBeInTheDocument()
  })

  it('opens confirmation modal and deletes a promotion', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    mockPromotions({ remove })

    renderWithProviders(<PromotionsPage />)

    const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' })
    expect(deleteButtons.length).toBeGreaterThan(0)
    await userEvent.click(deleteButtons[0])

    expect(
      screen.getByText(
        '¿Eliminar la promoción "2x1 en Hamburguesas"? Esta acción no se puede deshacer.',
      ),
    ).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    await userEvent.click(confirmButton)

    expect(remove).toHaveBeenCalledWith('pr1')
  })
})
