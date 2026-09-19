import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { isNavItemActive, useHasBackHeader } from '../navigation'
import { useDesktopNavigation } from '../DesktopNav/hooks/useDesktopNavigation'

const withPath = (path: string) => {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  )
}

describe('isNavItemActive', () => {
  it('matches prefixes for non-exact items', () => {
    expect(isNavItemActive('/orders/123', '/orders')).toBe(true)
    expect(isNavItemActive('/orders-extra', '/orders')).toBe(true)
  })

  it('matches exactly when requested', () => {
    expect(isNavItemActive('/orders/123', '/orders', true)).toBe(false)
    expect(isNavItemActive('/orders', '/orders', true)).toBe(true)
  })

  it('supports route params with matchPath', () => {
    expect(isNavItemActive('/orders/123/edit', '/orders/:id/edit', true)).toBe(true)
  })
})

describe('useHasBackHeader', () => {
  it('detects matching detail paths', () => {
    const { result } = renderHook(() => useHasBackHeader(['/orders/:id', '/products/:id']), {
      wrapper: withPath('/orders/42'),
    })
    expect(result.current).toBe(true)
  })

  it('is false for unrelated paths', () => {
    const { result } = renderHook(() => useHasBackHeader(['/orders/:id']), {
      wrapper: withPath('/catalog'),
    })
    expect(result.current).toBe(false)
  })
})

describe('useDesktopNavigation', () => {
  const items = [
    { path: '/', label: 'Inicio' },
    { path: '/orders', label: 'Pedidos', activePaths: ['/orders/:id'] },
  ]

  it('marks the home item active only on the root path', () => {
    const { result } = renderHook(() => useDesktopNavigation(items, '/'), {
      wrapper: withPath('/'),
    })
    expect(result.current.isActive('/')).toBe(true)
    expect(result.current.isActive('/orders')).toBe(false)
  })

  it('marks an item active through its extra active paths', () => {
    const { result } = renderHook(() => useDesktopNavigation(items, '/'), {
      wrapper: withPath('/orders/99'),
    })
    expect(result.current.isActive('/orders')).toBe(true)
  })
})
