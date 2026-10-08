import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AdminLayout } from '../index'

const auth = vi.hoisted(() => ({ logout: vi.fn() }))

vi.mock('@repo/auth', () => ({ useLogout: () => auth.logout }))

const renderAt = (route: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<div>inicio page</div>} />
        <Route path="/products" element={<div>productos page</div>} />
        <Route path="/products/new" element={<div>nuevo producto page</div>} />
        <Route path="/profile" element={<div>perfil page</div>} />
      </Route>
    </Routes>,
    { route },
  )

const link = (name: string) => screen.getByRole('link', { name, hidden: true })

const productLink = () =>
  screen
    .getAllByRole('link', { name: 'Productos', hidden: true })
    .find((item) => item.getAttribute('href') === '/products')

describe('AdminLayout', () => {
  it('renders the navigation sections and item links', () => {
    renderAt('/')

    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Operación')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('Reportes')).toBeInTheDocument()

    expect(link('Categorías')).toHaveAttribute('href', '/categories')
    expect(link('Ingredientes')).toHaveAttribute('href', '/ingredients')
    expect(link('Pedidos')).toHaveAttribute('href', '/orders')
    expect(link('Sucursales')).toHaveAttribute('href', '/branches')
    expect(link('Stock')).toHaveAttribute('href', '/stock')
    expect(link('Personal')).toHaveAttribute('href', '/staff')
    expect(link('Parámetros')).toHaveAttribute('href', '/parameters')

    const productHrefs = screen
      .getAllByRole('link', { name: 'Productos', hidden: true })
      .map((item) => item.getAttribute('href'))
    expect(productHrefs).toEqual(expect.arrayContaining(['/products', '/reports/products']))
  })

  it('marks home active only on the root route', () => {
    renderAt('/')
    expect(link('Inicio')).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark home active on nested routes', () => {
    renderAt('/products')
    expect(link('Inicio')).not.toHaveAttribute('aria-current')
    expect(productLink()).toHaveAttribute('aria-current', 'page')
  })

  it('marks other items active by path prefix', () => {
    renderAt('/products/new')
    expect(productLink()).toHaveAttribute('aria-current', 'page')
    expect(link('Inicio')).not.toHaveAttribute('aria-current')
  })

  it('highlights Mi perfil when the pathname starts with /profile', () => {
    renderAt('/profile')
    expect(link('Mi perfil')).toHaveAttribute('aria-current', 'page')
  })

  it('does not highlight Mi perfil on other routes', () => {
    renderAt('/')
    expect(link('Mi perfil')).not.toHaveAttribute('aria-current')
  })

  it('logs out from the sidebar', async () => {
    renderAt('/')

    await userEvent.click(screen.getByText('Salir'))

    expect(auth.logout).toHaveBeenCalledTimes(1)
  })
})
