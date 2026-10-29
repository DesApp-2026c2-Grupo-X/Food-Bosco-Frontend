import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { BranchStock } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { LowStockAlertsSection } from '../LowStockAlertsSection'
import { StockListView } from '../StockListView'

const pan: BranchStock = {
  ingredientId: 'i1',
  branchId: 'b1',
  quantity: 10,
  ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
}

const queso: BranchStock = {
  ingredientId: 'i2',
  branchId: 'b2',
  quantity: 4,
  ingredient: { id: 'i2', name: 'Queso', unit: 'kg', active: true },
}

const render = (overrides: Partial<Parameters<typeof StockListView>[0]> = {}) =>
  renderWithProviders(
    <StockListView
      rows={[pan, queso]}
      isLoading={false}
      isAdjusting={false}
      title="Stock"
      description="desc"
      onAdjust={vi.fn()}
      {...overrides}
    />,
  )

describe('StockListView', () => {
  it('F-12: renderiza ingrediente, cantidad + unidad y botón Ajustar', () => {
    render()

    expect(screen.getByText('Pan')).toBeInTheDocument()
    expect(screen.getByText('10 un')).toBeInTheDocument()
    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.getByText('4 kg')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Ajustar' })).toHaveLength(2)
  })

  it('F-13: la búsqueda filtra por nombre de ingrediente', async () => {
    render()

    await userEvent.type(screen.getByPlaceholderText('Buscar ingrediente...'), 'pan')

    await waitFor(() => expect(screen.queryByText('Queso')).not.toBeInTheDocument())
    expect(screen.getByText('Pan')).toBeInTheDocument()
  })

  it('F-14: con showBranch muestra el nombre de sucursal o el id', () => {
    render({ showBranch: true, branchName: (id) => (id === 'b1' ? 'Centro' : `Sucursal ${id}`) })

    expect(screen.getByText('Centro')).toBeInTheDocument()
    expect(screen.getByText('Sucursal b2')).toBeInTheDocument()
  })

  it('F-15: muestra estado vacío por defecto y personalizado', () => {
    const { unmount } = render({ rows: [] })
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    unmount()

    render({ rows: [], emptyTitle: 'Vacío', emptyDescription: 'Nada aquí' })
    expect(screen.getByText('Vacío')).toBeInTheDocument()
    expect(screen.getByText('Nada aquí')).toBeInTheDocument()
  })

  it('F-16: onAdjust recibe la fila seleccionada', async () => {
    const onAdjust = vi.fn()
    render({ onAdjust })

    await userEvent.click(screen.getAllByRole('button', { name: 'Ajustar' })[1] as HTMLElement)

    expect(onAdjust).toHaveBeenCalledWith(queso)
  })

  it('F-17: muestra badges de alerta, stock mínimo y permite filtrar por estado', async () => {
    const lowPan: BranchStock = {
      ingredientId: 'i1',
      branchId: 'b1',
      quantity: 5,
      ingredient: { id: 'i1', name: 'Pan', unit: 'un', minQuantity: 20, active: true },
    }
    const outQueso: BranchStock = {
      ingredientId: 'i2',
      branchId: 'b1',
      quantity: 0,
      ingredient: { id: 'i2', name: 'Queso', unit: 'kg', minQuantity: 10, active: true },
    }
    const okAgua: BranchStock = {
      ingredientId: 'i3',
      branchId: 'b1',
      quantity: 50,
      ingredient: { id: 'i3', name: 'Agua', unit: 'botella', minQuantity: 15, active: true },
    }

    render({ rows: [lowPan, outQueso, okAgua] })

    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByText('20 un')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Con stock bajo' }))
    await waitFor(() => expect(screen.queryByText('Agua')).not.toBeInTheDocument())
    expect(screen.queryByText('Queso')).not.toBeInTheDocument()
    expect(screen.getByText('Pan')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Con stock bajo' }))
    await waitFor(() => expect(screen.getByText('Agua')).toBeInTheDocument())
  })
})

describe('LowStockAlertsSection', () => {
  it('returns nothing when there are no alerts', () => {
    renderWithProviders(<LowStockAlertsSection alerts={[]} />)
    expect(screen.queryByText('Alertas de stock')).not.toBeInTheDocument()
  })

  it('renders low stock and out of stock alerts with branch and adjust action', async () => {
    const onAdjust = vi.fn()
    const alerts: BranchStock[] = [
      {
        ingredientId: 'i1',
        branchId: 'b1',
        quantity: 0,
        ingredient: { id: 'i1', name: 'Tomate', unit: 'un', minQuantity: 15, active: true },
      },
      {
        ingredientId: 'i2',
        branchId: 'b2',
        quantity: 4,
        ingredient: { id: 'i2', name: 'Pan', unit: 'un', minQuantity: 20, active: true },
      },
    ]

    renderWithProviders(
      <LowStockAlertsSection
        alerts={alerts}
        showBranch
        branchName={(id) => (id === 'b1' ? 'Centro' : 'Norte')}
        stockPath="/stock"
        onAdjust={onAdjust}
      />,
    )

    expect(screen.getByText('Alertas de stock')).toBeInTheDocument()
    expect(screen.getByText('2 ingredientes')).toBeInTheDocument()
    expect(screen.getByText('Tomate · Centro')).toBeInTheDocument()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByText('Disponible: 0 un · Mínimo: 15 un')).toBeInTheDocument()
    expect(screen.getByText('Pan · Norte')).toBeInTheDocument()
    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Disponible: 4 un · Mínimo: 20 un')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todo el stock' })).toHaveAttribute('href', '/stock')

    await userEvent.click(screen.getAllByRole('button', { name: 'Ajustar' })[0] as HTMLElement)
    expect(onAdjust).toHaveBeenCalledWith(alerts[0])
  })
})
