import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActiveStatusText, EmptyState, LoadingState } from '../feedback'
import { renderWithProviders } from '@test/utils'

describe('EmptyState', () => {
  it('renders icon, title, description and action', () => {
    renderWithProviders(
      <EmptyState
        icon={<span>icono</span>}
        title="Sin resultados"
        description="No encontramos nada"
        action={<button>Crear</button>}
      />,
    )

    expect(screen.getByText('icono')).toBeInTheDocument()
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    expect(screen.getByText('No encontramos nada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()
  })
})

describe('LoadingState', () => {
  it('shows a spinner by default', () => {
    const { container } = renderWithProviders(<LoadingState />)

    expect(container.querySelector('.chakra-spinner')).toBeInTheDocument()
    expect(container.querySelector('.chakra-skeleton')).not.toBeInTheDocument()
  })

  it('renders the requested number of skeletons', () => {
    const { container } = renderWithProviders(<LoadingState variant="skeleton" skeletonCount={3} />)

    expect(container.querySelectorAll('.chakra-skeleton')).toHaveLength(3)
    expect(container.querySelector('.chakra-spinner')).not.toBeInTheDocument()
  })
})

describe('ActiveStatusText', () => {
  it.each([
    [true, false, 'Activo'],
    [true, true, 'Activa'],
    [false, false, 'Inactivo'],
    [false, true, 'Inactiva'],
  ])('renders %s with feminine=%s as %s', (active, feminine, expected) => {
    renderWithProviders(<ActiveStatusText active={active} feminine={feminine} />)

    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
