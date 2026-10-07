import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { HomePage } from '../index'

describe('HomePage', () => {
  it('renders the page header and the quick access links', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Categorías/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Productos/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ingredientes/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Sucursales/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pedidos/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Personal/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Parámetros/ })).toBeInTheDocument()
  })

  it('points each quick access link to its route', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole('link', { name: /Productos/ })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: /Sucursales/ })).toHaveAttribute('href', '/branches')
    expect(screen.getByRole('link', { name: /Pedidos/ })).toHaveAttribute('href', '/orders')
  })
})
