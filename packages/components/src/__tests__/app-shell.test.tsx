import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'
import { AppShell } from '../AppShell'
import type { DesktopNavItem } from '../DesktopNav/types'
import { renderWithProviders } from '@test/utils'

const navItems: DesktopNavItem[] = [
  { id: 'home', label: 'Inicio', path: '/' },
  { id: 'orders', label: 'Pedidos', path: '/orders' },
]

describe('AppHeader', () => {
  it('renders logo, actions, overlays and resolves active state', () => {
    const isActive = vi.fn((path: string) => path === '/orders')

    renderWithProviders(
      <AppHeader
        navItems={navItems}
        isActive={isActive}
        logo={<span>Marca</span>}
        actions={<button>Acción</button>}
        overlays={<div>Overlay</div>}
      />,
      { route: '/orders' },
    )

    expect(screen.getByText('Marca')).toBeInTheDocument()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
    expect(screen.getByText('Overlay')).toBeInTheDocument()
    expect(isActive).toHaveBeenCalledWith('/')
    expect(isActive).toHaveBeenCalledWith('/orders')
  })

  it('styles the active nav item differently', () => {
    renderWithProviders(
      <AppHeader
        navItems={navItems}
        isActive={(path) => path === '/orders'}
        logo={<span>Marca</span>}
        actions={null}
      />,
      { route: '/orders' },
    )

    const active = (screen.getByText('Pedidos').closest('a') as HTMLElement).className
    const inactive = (screen.getByText('Inicio').closest('a') as HTMLElement).className

    expect(active).not.toBe(inactive)
  })
})

describe('AppShell', () => {
  it('renders header, children, mobile nav and overlays', () => {
    renderWithProviders(
      <AppShell
        header={<div>Cabecera</div>}
        showHeader
        mobileNav={<div>Nav móvil</div>}
        overlays={<div>Overlay shell</div>}
      >
        <div>Contenido de la página</div>
      </AppShell>,
    )

    expect(screen.getByText('Cabecera')).toBeInTheDocument()
    expect(screen.getByText('Contenido de la página')).toBeInTheDocument()
    expect(screen.getByText('Nav móvil')).toBeInTheDocument()
    expect(screen.getByText('Overlay shell')).toBeInTheDocument()
  })

  it('changes the header wrapper visibility with showHeader', () => {
    const { unmount } = renderWithProviders(
      <AppShell header={<div>Cabecera</div>} showHeader mobileNav={null}>
        <div>Contenido</div>
      </AppShell>,
    )
    const visibleClass = (screen.getByText('Cabecera').parentElement as HTMLElement).className
    unmount()

    renderWithProviders(
      <AppShell header={<div>Cabecera</div>} showHeader={false} mobileNav={null}>
        <div>Contenido</div>
      </AppShell>,
    )
    const hiddenClass = (screen.getByText('Cabecera').parentElement as HTMLElement).className

    expect(visibleClass).not.toBe(hiddenClass)
  })
})
