import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SVGProps } from 'react'
import { NavItem } from '../NavItem'
import { MenuLink } from '../MenuLink'
import { LogoLink } from '../LogoLink'
import { TextLink } from '../TextLink'
import { QuickAccessGrid } from '../QuickAccessGrid'
import { Chip } from '../Chip'
import { ChipCarousel } from '../ChipCarousel'
import { renderWithProviders } from '@test/utils'

const Icon = (props: SVGProps<SVGSVGElement>) => <svg {...props} />

const linkClass = (label: string) => (screen.getByText(label).closest('a') as HTMLElement).className

describe('NavItem', () => {
  it('renders the pill and sidebar variants differently', () => {
    const { unmount } = renderWithProviders(
      <NavItem to="/orders" label="Pill" active icon={<Icon />} />,
    )
    const pillClass = linkClass('Pill')
    unmount()

    renderWithProviders(
      <NavItem to="/orders" label="Sidebar" active icon={<Icon />} variant="sidebar" />,
    )

    expect(linkClass('Sidebar')).not.toBe(pillClass)
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    renderWithProviders(<NavItem to="/orders" label="Pedidos" active={false} onClick={onClick} />)

    await userEvent.click(screen.getByText('Pedidos'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('MenuLink', () => {
  it('renders a router link with the target path', () => {
    renderWithProviders(<MenuLink to="/destino">Ir</MenuLink>)

    expect(screen.getByText('Ir').closest('a')).toHaveAttribute('href', '/destino')
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    renderWithProviders(
      <MenuLink to="/destino" onClick={onClick}>
        Ir
      </MenuLink>,
    )

    await userEvent.click(screen.getByText('Ir'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('LogoLink', () => {
  it('uses the default accessible label', () => {
    renderWithProviders(
      <LogoLink to="/home">
        <span>Logo</span>
      </LogoLink>,
    )

    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/home')
  })

  it('accepts a custom accessible label', () => {
    renderWithProviders(
      <LogoLink to="/home" ariaLabel="Volver al inicio">
        <span>Logo</span>
      </LogoLink>,
    )

    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument()
  })
})

describe('TextLink', () => {
  it('renders a router link', () => {
    renderWithProviders(<TextLink to="/ayuda">Ver más</TextLink>)

    expect(screen.getByRole('link', { name: 'Ver más' })).toHaveAttribute('href', '/ayuda')
  })
})

describe('QuickAccessGrid', () => {
  it('renders each item with label and description', () => {
    renderWithProviders(
      <QuickAccessGrid
        items={[
          {
            id: 'orders',
            label: 'Pedidos',
            description: 'Gestioná los pedidos',
            path: '/orders',
            icon: Icon,
          },
        ]}
      />,
    )

    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Gestioná los pedidos')).toBeInTheDocument()
    expect(screen.getByText('Pedidos').closest('a')).toHaveAttribute('href', '/orders')
  })
})

describe('Chip', () => {
  it('styles the active chip differently', () => {
    const { unmount } = renderWithProviders(<Chip label="Activo" active onClick={vi.fn()} />)
    const activeClass = screen.getByRole('button', { name: 'Activo' }).className
    unmount()

    renderWithProviders(<Chip label="Inactivo" active={false} onClick={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Inactivo' }).className).not.toBe(activeClass)
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    renderWithProviders(<Chip label="Todos" active={false} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button', { name: 'Todos' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('ChipCarousel', () => {
  it('renders each chip and forwards clicks', async () => {
    const onFirst = vi.fn()
    const onSecond = vi.fn()

    renderWithProviders(
      <ChipCarousel
        items={[
          { id: 1, label: 'Todos', active: true, onClick: onFirst },
          { id: 2, label: 'Bebidas', active: false, onClick: onSecond },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Bebidas' }))

    expect(onSecond).toHaveBeenCalledTimes(1)
    expect(onFirst).not.toHaveBeenCalled()
  })
})
