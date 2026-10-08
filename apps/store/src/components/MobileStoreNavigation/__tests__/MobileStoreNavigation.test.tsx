import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MobileStoreNavigation } from '../index'
import { renderWithProviders } from '@test/utils'

const itemClass = (name: string) => {
  const link = screen.getByRole('link', { name })
  return link.firstElementChild?.className ?? ''
}

describe('MobileStoreNavigation', () => {
  it('renders every navigation item and the cart badge', () => {
    renderWithProviders(<MobileStoreNavigation count={2} />, { route: '/' })

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Catálogo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Carrito' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Perfil' })).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('hides the cart badge when the count is zero', () => {
    renderWithProviders(<MobileStoreNavigation count={0} />, { route: '/' })

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('marks home as active on the home route', () => {
    renderWithProviders(<MobileStoreNavigation count={0} />, { route: '/' })

    expect(itemClass('Inicio')).not.toBe(itemClass('Pedidos'))
  })

  it('does not mark home as active outside the exact home route', () => {
    renderWithProviders(<MobileStoreNavigation count={0} />, { route: '/catalog' })

    expect(itemClass('Inicio')).toBe(itemClass('Pedidos'))
    expect(itemClass('Inicio')).not.toBe(itemClass('Catálogo'))
  })
})
