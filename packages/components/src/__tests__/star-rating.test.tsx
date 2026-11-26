import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StarRating } from '../StarRating'
import { renderWithProviders } from '@test/utils'

describe('StarRating', () => {
  it('muestra el promedio en modo lectura', () => {
    renderWithProviders(<StarRating value={4} readOnly label="Promedio" />)

    expect(screen.getByRole('img', { name: 'Promedio: 4 de 5 estrellas' })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('selecciona una estrella con el mouse', async () => {
    const onChange = vi.fn()
    renderWithProviders(<StarRating value={0} onChange={onChange} label="Sucursal" />)

    await userEvent.click(screen.getByRole('radio', { name: '4 estrellas' }))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('permite navegar y seleccionar con teclado', async () => {
    const onChange = vi.fn()
    renderWithProviders(<StarRating value={0} onChange={onChange} label="Sucursal" />)

    await userEvent.tab()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalled()
  })

  it('marca la estrella seleccionada y deshabilita la interacción', async () => {
    const onChange = vi.fn()
    renderWithProviders(<StarRating value={3} onChange={onChange} disabled label="Sucursal" />)

    const third = screen.getByRole('radio', { name: '3 estrellas' })
    expect(third).toHaveAttribute('aria-checked', 'true')
    expect(third).toBeDisabled()

    await userEvent.click(third)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('pinta medias estrellas en modo lectura para promedios fraccionarios', () => {
    const { container, rerender } = renderWithProviders(
      <StarRating value={3.5} readOnly label="Promedio" />,
    )

    expect(screen.getByRole('img', { name: 'Promedio: 3.5 de 5 estrellas' })).toBeInTheDocument()
    const states35 = Array.from(container.querySelectorAll('[data-star-state]')).map((el) =>
      el.getAttribute('data-star-state'),
    )
    expect(states35).toEqual(['full', 'full', 'full', 'half', 'empty'])

    rerender(<StarRating value={4.4} readOnly label="Promedio" />)
    expect(
      Array.from(container.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'half'])

    rerender(<StarRating value={4.0} readOnly label="Promedio" />)
    expect(
      Array.from(container.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'empty'])

    rerender(<StarRating value={4.1} readOnly label="Promedio" />)
    expect(
      Array.from(container.querySelectorAll('[data-star-state]')).map((el) =>
        el.getAttribute('data-star-state'),
      ),
    ).toEqual(['full', 'full', 'full', 'full', 'empty'])
  })

  it('mantiene únicamente 5 opciones enteras en modo interactivo', () => {
    const onChange = vi.fn()
    renderWithProviders(<StarRating value={0} onChange={onChange} label="Repartidor" />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(5)
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual([
      '1 estrella',
      '2 estrellas',
      '3 estrellas',
      '4 estrellas',
      '5 estrellas',
    ])
  })
})
