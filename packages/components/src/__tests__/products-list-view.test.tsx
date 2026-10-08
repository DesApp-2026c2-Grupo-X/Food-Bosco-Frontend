import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { ProductsListView } from '../ProductsListView'
import type { ProductListLine, ProductsListViewProps } from '../ProductsListView/types'

const mesa: ProductListLine = {
  product: { id: 'p1', name: 'Mesa', image: 'https://cdn.test/mesa.png', price: 1000 },
  categoryName: 'Comida',
  available: true,
}

const gaseosa: ProductListLine = {
  product: { id: 'p2', name: 'Gaseosa', image: null, price: 500 },
  categoryName: 'Bebida',
  available: false,
}

const render = (overrides: Partial<ProductsListViewProps> = {}) =>
  renderWithProviders(
    <ProductsListView
      rows={[mesa, gaseosa]}
      isLoading={false}
      isToggling={false}
      description="Listado"
      onToggle={vi.fn()}
      {...overrides}
    />,
  )

describe('ProductsListView', () => {
  it('filtra por nombre y por categoría', async () => {
    const { unmount } = render()

    await userEvent.type(screen.getByPlaceholderText('Buscar producto...'), 'bebida')
    await waitFor(() => expect(screen.queryByText('Mesa')).not.toBeInTheDocument())
    expect(screen.getByText('Gaseosa')).toBeInTheDocument()
    unmount()

    render()
    await userEvent.type(screen.getByPlaceholderText('Buscar producto...'), 'mesa')
    await waitFor(() => expect(screen.queryByText('Gaseosa')).not.toBeInTheDocument())
    expect(screen.getByText('Mesa')).toBeInTheDocument()
  })

  it('muestra imagen cuando existe y placeholder cuando no', () => {
    const { container } = render()

    const image = screen.getByAltText('Mesa')
    expect(image).toHaveAttribute('src', 'https://cdn.test/mesa.png')
    expect(screen.queryByAltText('Gaseosa')).not.toBeInTheDocument()
    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it('alterna disponibilidad enviando id y estado', async () => {
    const onToggle = vi.fn()
    render({ onToggle })

    await userEvent.click(screen.getByLabelText('Disponibilidad de Mesa'))

    expect(onToggle).toHaveBeenCalledWith('p1', false)
  })

  it('no permite alternar mientras isToggling', async () => {
    const onToggle = vi.fn()
    render({ isToggling: true, onToggle })

    await userEvent.click(screen.getByLabelText('Disponibilidad de Mesa'))

    expect(onToggle).not.toHaveBeenCalled()
  })

  it('renderiza la etiqueta del botón de creación y dispara onCreate', async () => {
    const onCreate = vi.fn()
    const { unmount } = render({ onCreate })

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }))
    expect(onCreate).toHaveBeenCalledTimes(1)
    unmount()

    render({ onCreate: vi.fn(), createLabel: 'Agregar producto' })
    expect(screen.getByRole('button', { name: 'Agregar producto' })).toBeInTheDocument()
  })

  it('renderiza rowAction por fila', () => {
    render({ rowAction: (row) => <button type="button">Editar {row.product.name}</button> })

    expect(screen.getByRole('button', { name: 'Editar Mesa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar Gaseosa' })).toBeInTheDocument()
  })
})
