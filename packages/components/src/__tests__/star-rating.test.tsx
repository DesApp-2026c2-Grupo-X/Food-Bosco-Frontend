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
})
