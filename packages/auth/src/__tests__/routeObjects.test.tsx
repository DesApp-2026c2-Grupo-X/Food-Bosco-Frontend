import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { authRoutes } from '../routes'
import { authRouteObjects, type AuthRoutesConfig } from '../routeObjects'

const childrenPaths = (config: AuthRoutesConfig) => {
  const [route] = authRouteObjects(config)
  return (route.children ?? []).map((child) => child.path)
}

describe('authRouteObjects', () => {
  it('includes the register route by default', () => {
    expect(childrenPaths({})).toContain(authRoutes.register)
  })

  it('omits the register route when showRegister is false', () => {
    const paths = childrenPaths({ showRegister: false })

    expect(paths).not.toContain(authRoutes.register)
    expect(paths).toContain(authRoutes.login)
  })

  it('exposes login, register, forgot and reset paths in order', () => {
    expect(childrenPaths({})).toEqual([
      authRoutes.login,
      authRoutes.register,
      authRoutes.forgotPassword,
      authRoutes.resetPassword,
    ])
  })

  it('forwards the app config to the AuthProvider element', () => {
    const redirectByRole = () => {}
    const [route] = authRouteObjects({
      defaultPath: '/home',
      branchUrl: '/branch',
      adminUrl: '/admin',
      riderUrl: '/rider',
      redirectByRole,
      registerDefaultRole: 'rider',
      registerRoles: ['rider'],
      showRegister: false,
    })

    const provider = route.element as ReactElement<Record<string, unknown>>

    expect(provider.props).toMatchObject({
      defaultPath: '/home',
      branchUrl: '/branch',
      adminUrl: '/admin',
      riderUrl: '/rider',
      redirectByRole,
      registerDefaultRole: 'rider',
      registerRoles: ['rider'],
      showRegister: false,
    })
  })

  it('forwards the layout assets to the AuthLayout element', () => {
    const [route] = authRouteObjects({
      logoLight: 'light.svg',
      logoDark: 'dark.svg',
      image: 'background.jpg',
    })

    const provider = route.element as ReactElement<{
      children: ReactElement<Record<string, unknown>>
    }>

    expect(provider.props.children.props).toMatchObject({
      logoLight: 'light.svg',
      logoDark: 'dark.svg',
      image: 'background.jpg',
    })
  })
})
