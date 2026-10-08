import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SVGProps } from 'react'
import { MobileNav } from '../MobileNav'
import { MobileNavItem } from '../MobileNav/MobileNavItem'
import type { MobileNavItem as MobileNavItemData } from '../MobileNav/types'
import { renderWithProviders } from '@test/utils'

const Icon = (props: SVGProps<SVGSVGElement>) => <svg {...props} />

const boxClass = (label: string) =>
  (screen.getByText(label).closest('a')?.firstElementChild as HTMLElement).className

describe('MobileNav', () => {
  it('renders every item with its label', () => {
    const items: MobileNavItemData[] = [
      { id: 'home', label: 'Inicio', path: '/', icon: Icon },
      { id: 'orders', label: 'Pedidos', path: '/orders', icon: Icon },
    ]

    renderWithProviders(<MobileNav items={items} />)

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Pedidos')).toBeInTheDocument()
  })

  it('uses a custom aria label', () => {
    const items: MobileNavItemData[] = [{ id: 'home', label: 'Inicio', path: '/', icon: Icon }]

    renderWithProviders(<MobileNav items={items} ariaLabel="Accesos" />)

    expect(screen.getByLabelText('Accesos')).toBeInTheDocument()
  })

  it('marks the item matching the current path as active', () => {
    const items: MobileNavItemData[] = [
      { id: 'home', label: 'Inicio', path: '/', exact: true, icon: Icon },
      { id: 'orders', label: 'Pedidos', path: '/orders', icon: Icon },
    ]

    renderWithProviders(<MobileNav items={items} />, { route: '/orders' })

    expect(boxClass('Pedidos')).not.toBe(boxClass('Inicio'))
  })

  it('marks an item active through its extra active paths', () => {
    const items: MobileNavItemData[] = [
      {
        id: 'profile',
        label: 'Perfil',
        path: '/profile',
        activePaths: ['/account/:id'],
        icon: Icon,
      },
      { id: 'settings', label: 'Ajustes', path: '/settings', icon: Icon },
    ]

    renderWithProviders(<MobileNav items={items} />, { route: '/account/99' })

    expect(boxClass('Perfil')).not.toBe(boxClass('Ajustes'))
  })

  it('only marks exact items active on the exact path', () => {
    const items: MobileNavItemData[] = [
      { id: 'exact', label: 'Exacto', path: '/orders', exact: true, icon: Icon },
      { id: 'prefix', label: 'Prefijo', path: '/orders', icon: Icon },
    ]

    renderWithProviders(<MobileNav items={items} />, { route: '/orders/1' })

    expect(boxClass('Exacto')).not.toBe(boxClass('Prefijo'))
  })
})

describe('MobileNavItem', () => {
  const item = { id: 'orders', label: 'Pedidos', path: '/orders', icon: Icon }

  it('shows the badge value when positive', () => {
    renderWithProviders(<MobileNavItem item={{ ...item, badge: 5 }} isActive={false} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('hides the badge when zero or absent', () => {
    const { unmount } = renderWithProviders(
      <MobileNavItem item={{ ...item, badge: 0 }} isActive={false} />,
    )

    expect(screen.queryByText('0')).not.toBeInTheDocument()
    unmount()

    renderWithProviders(<MobileNavItem item={item} isActive={false} />)

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
