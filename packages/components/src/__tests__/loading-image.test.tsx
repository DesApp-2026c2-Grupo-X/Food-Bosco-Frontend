import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingImage } from '../LoadingImage'
import { renderWithProviders } from '@test/utils'

describe('LoadingImage', () => {
  it('muestra un skeleton hasta que la imagen carga y luego la revela', () => {
    const { container } = renderWithProviders(
      <LoadingImage src="https://cdn/producto.png" alt="Producto" />,
    )

    expect(container.querySelector('.chakra-skeleton')).toBeInTheDocument()

    fireEvent.load(screen.getByRole('img', { name: 'Producto' }))

    expect(container.querySelector('.chakra-skeleton')).not.toBeInTheDocument()
  })

  it('muestra el fallback cuando no hay imagen', () => {
    renderWithProviders(
      <LoadingImage src={null} alt="Producto" fallback={<span>Sin imagen</span>} />,
    )

    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
  })

  it('muestra el fallback cuando la imagen falla', () => {
    renderWithProviders(
      <LoadingImage src="https://cdn/rota.png" alt="Producto" fallback={<span>Error</span>} />,
    )

    fireEvent.error(screen.getByRole('img', { name: 'Producto' }))

    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})
