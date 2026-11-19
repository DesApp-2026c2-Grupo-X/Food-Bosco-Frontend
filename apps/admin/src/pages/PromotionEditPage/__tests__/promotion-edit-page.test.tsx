import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Category, Promotion } from '@repo/domain'
import { useAdminCategories, useAdminProducts, useAdminPromotions, useBranches } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { PromotionEditPage } from '../index'

vi.mock('@repo/api', () => ({
  useAdminPromotions: vi.fn(),
  useAdminCategories: vi.fn(),
  useAdminProducts: vi.fn(),
  useBranches: vi.fn(),
  getApiErrorMessage: (err: unknown) => String(err),
}))

const existingPromo: Promotion = {
  id: 'pr1',
  name: '20% OFF Hamburguesas',
  description: 'Descuento del 20% en toda la categoría',
  active: true,
  type: 'PERCENTAGE',
  discountValue: 20,
  maxDiscount: 3000,
  buyQuantity: null,
  payQuantity: null,
  scope: 'CATEGORY',
  categoryIds: ['cat-1'],
  productIds: [],
  branchIds: [],
  daysOfWeek: [1, 2, 3],
  startTime: '19:00',
  endTime: '23:59',
  minSubtotal: 4000,
  minQuantity: 0,
  code: 'PROMO20',
  stackable: true,
  priority: 15,
  maxUsesTotal: 500,
  maxUsesPerCustomer: 2,
  usedCount: 14,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T23:59:59.999Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const cat1: Category = { id: 'cat-1', name: 'Hamburguesas', active: true }
const cat2: Category = { id: 'cat-2', name: 'Bebidas', active: true }

const setupMocks = (overrides?: Partial<ReturnType<typeof useAdminPromotions>>) => {
  const create = vi.fn().mockResolvedValue(undefined)
  const update = vi.fn().mockResolvedValue(undefined)

  vi.mocked(useAdminPromotions).mockReturnValue({
    promotions: [existingPromo],
    isLoading: false,
    isMutating: false,
    create,
    update,
    toggle: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAdminPromotions>)

  vi.mocked(useAdminCategories).mockReturnValue({
    categories: [cat1, cat2],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  } as ReturnType<typeof useAdminCategories>)

  vi.mocked(useAdminProducts).mockReturnValue({
    products: [],
    isLoading: false,
    isToggling: false,
    setAvailable: vi.fn(),
  } as ReturnType<typeof useAdminProducts>)

  vi.mocked(useBranches).mockReturnValue({
    branches: [],
    isLoading: false,
    isMutating: false,
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    saveHours: vi.fn(),
  } as ReturnType<typeof useBranches>)

  return { create, update }
}

describe('PromotionEditPage', () => {
  it('renders new promotion form with tabs and default values', () => {
    setupMocks()

    renderWithProviders(
      <Routes>
        <Route path="/promotions/new" element={<PromotionEditPage />} />
      </Routes>,
      { route: '/promotions/new' },
    )

    expect(screen.getByRole('heading', { name: 'Nueva promoción' })).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Beneficio')).toBeInTheDocument()
    expect(screen.getByText('Alcance')).toBeInTheDocument()
    expect(screen.getByText('Condiciones')).toBeInTheDocument()
    expect(screen.getByText('Cupón y Límites')).toBeInTheDocument()
  })

  it('populates fields when editing an existing promotion', async () => {
    setupMocks()

    renderWithProviders(
      <Routes>
        <Route path="/promotions/:promotionId/edit" element={<PromotionEditPage />} />
      </Routes>,
      { route: '/promotions/pr1/edit' },
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('20% OFF Hamburguesas')).toBeInTheDocument()
    })
  })
})
