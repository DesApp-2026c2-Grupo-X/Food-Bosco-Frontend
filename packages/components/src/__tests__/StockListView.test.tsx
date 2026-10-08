import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { BranchStock } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
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
})
