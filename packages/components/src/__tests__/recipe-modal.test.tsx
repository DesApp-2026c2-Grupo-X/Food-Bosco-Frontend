import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecipeModal } from '../RecipeModal'
import { renderWithProviders } from '@test/utils'

describe('RecipeModal', () => {
  it('shows the empty message when there are no items', () => {
    renderWithProviders(<RecipeModal open items={[]} onClose={vi.fn()} />)

    expect(screen.getByText('Este producto no tiene receta cargada.')).toBeInTheDocument()
  })

  it('renders item rows with quantity and unit', () => {
    renderWithProviders(
      <RecipeModal
        open
        onClose={vi.fn()}
        items={[
          { name: 'Pan', quantity: 2, unit: 'un' },
          { name: 'Queso', quantity: 150, unit: 'g' },
        ]}
      />,
    )

    expect(screen.getByText('Pan')).toBeInTheDocument()
    expect(screen.getByText('2 un')).toBeInTheDocument()
    expect(screen.getByText('Queso')).toBeInTheDocument()
    expect(screen.getByText('150 g')).toBeInTheDocument()
  })

  it('uses the default title', () => {
    renderWithProviders(<RecipeModal open items={[]} onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Receta' })).toBeInTheDocument()
  })

  it('renders the description only when provided', () => {
    const { rerender } = renderWithProviders(
      <RecipeModal open items={[]} onClose={vi.fn()} description="Receta base" />,
    )
    expect(screen.getByText('Receta base')).toBeInTheDocument()

    rerender(<RecipeModal open items={[]} onClose={vi.fn()} />)
    expect(screen.queryByText('Receta base')).not.toBeInTheDocument()
  })
})
