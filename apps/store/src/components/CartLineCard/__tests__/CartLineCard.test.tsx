import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CartItem } from '@repo/domain'
import { CartLineCard } from '../index'
import { renderWithProviders } from '@test/utils'

const item: CartItem = {
  id: 'i1',
  productId: 'p1',
  product: {
    id: 'p1',
    categoryId: 'c1',
    name: 'Burger',
    description: 'Rica',
    price: 1000,
    image: null,
    available: true,
    configGroups: [],
    recipe: [],
  },
  quantity: 2,
  observations: 'Sin cebolla',
  optionIds: ['o1', 'o2'],
  options: [
    { id: 'o1', name: 'Queso', extraPrice: 150, available: true },
    { id: 'o2', name: 'Bacon', extraPrice: 250, available: true },
  ],
}

describe('CartLineCard', () => {
  it('renders the product, options, note and computed prices', () => {
    renderWithProviders(<CartLineCard item={item} onQuantityChange={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Queso · Bacon')).toBeInTheDocument()
    expect(screen.getByText('Nota: Sin cebolla')).toBeInTheDocument()
    expect(screen.getByText(/1\.400 c\/u/)).toBeInTheDocument()
    expect(screen.getByText(/2\.800/)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('notifies quantity changes through the stepper', async () => {
    const onQuantityChange = vi.fn()
    renderWithProviders(<CartLineCard item={item} onQuantityChange={onQuantityChange} onRemove={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))

    expect(onQuantityChange).toHaveBeenCalledWith('i1', 3)
  })

  it('asks to remove the line', async () => {
    const onRemove = vi.fn()
    renderWithProviders(<CartLineCard item={item} onQuantityChange={vi.fn()} onRemove={onRemove} />)

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }))

    expect(onRemove).toHaveBeenCalledWith('i1')
  })

  it('disables the controls while mutating', () => {
    renderWithProviders(
      <CartLineCard item={item} onQuantityChange={vi.fn()} onRemove={vi.fn()} disabled />,
    )

    expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Quitar uno' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Eliminar/ })).toBeDisabled()
  })
})
