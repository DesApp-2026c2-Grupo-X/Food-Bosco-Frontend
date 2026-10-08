import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps, SVGProps } from 'react'
import { DashboardLayout } from '../DashboardLayout'
import type { DashboardNavSection } from '../DashboardLayout/types'
import { renderWithProviders } from '@test/utils'

const Icon = (props: SVGProps<SVGSVGElement>) => <svg {...props} />
const Logo = ({ height }: { height?: number | string }) => (
  <div data-testid="logo" data-height={height} />
)

const navSections: DashboardNavSection[] = [
  {
    id: 'main',
    label: 'Principal',
    items: [
      { id: 'home', label: 'Inicio', path: '/', icon: Icon, exact: true },
      { id: 'orders', label: 'Pedidos', path: '/orders', icon: Icon },
    ],
  },
  {
    id: 'config',
    items: [{ id: 'settings', label: 'Ajustes', path: '/settings', icon: Icon }],
  },
]

const renderLayout = (props: Partial<ComponentProps<typeof DashboardLayout>> = {}, route = '/') =>
  renderWithProviders(
    <DashboardLayout
      navSections={navSections}
      logo={Logo}
      brandSubtitle="Sucursal Centro"
      headerTitle="Food Bosco"
      onLogout={vi.fn()}
      {...props}
    >
      <div>contenido principal</div>
    </DashboardLayout>,
    { route },
  )

const openDrawer = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
  return screen.findByRole('dialog')
}

describe('DashboardLayout', () => {
  it('renders section labels, chrome and children', () => {
    renderLayout({ sidebarFooter: <div>Footer del sidebar</div>, extras: <div>Extras</div> })

    expect(screen.getByText('Principal')).toBeInTheDocument()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
    expect(screen.getByText('Ajustes')).toBeInTheDocument()
    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    expect(screen.getByText('Food Bosco')).toBeInTheDocument()
    expect(screen.getByText('contenido principal')).toBeInTheDocument()
    expect(screen.getByText('Footer del sidebar')).toBeInTheDocument()
    expect(screen.getByText('Extras')).toBeInTheDocument()
    expect(screen.getAllByTestId('logo').length).toBeGreaterThan(0)
  })

  it('marks the matching nav item as active', () => {
    renderLayout({}, '/orders')

    expect(screen.getByText('Pedidos').closest('a')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Inicio').closest('a')).not.toHaveAttribute('aria-current')
  })

  it('opens the mobile drawer from the menu button', async () => {
    renderLayout()

    const dialog = await openDrawer()

    expect(within(dialog).getByText('Salir')).toBeInTheDocument()
    expect(within(dialog).getByText('Ajustes')).toBeInTheDocument()
  })

  it('closes the drawer when a nav item is clicked', async () => {
    renderLayout()
    const dialog = await openDrawer()

    await userEvent.click(within(dialog).getByText('Ajustes'))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('calls onLogout and closes the drawer', async () => {
    const onLogout = vi.fn()
    renderLayout({ onLogout })
    const dialog = await openDrawer()

    await userEvent.click(within(dialog).getByText('Salir'))

    expect(onLogout).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('renders header actions', () => {
    renderLayout({ headerActions: <button>Acción de cabecera</button> })

    expect(screen.getByRole('button', { name: 'Acción de cabecera' })).toBeInTheDocument()
  })
})
