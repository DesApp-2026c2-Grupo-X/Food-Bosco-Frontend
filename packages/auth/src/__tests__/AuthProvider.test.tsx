import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AuthProvider, type AuthProviderProps } from '../AuthProvider'
import { useAuthConfig } from '../authConfigContext'

const ConfigProbe = () => {
  const config = useAuthConfig()

  return (
    <dl>
      <dd data-testid="defaultPath">{config.defaultPath}</dd>
      <dd data-testid="registerDefaultRole">{config.registerDefaultRole}</dd>
      <dd data-testid="registerRoles">{config.registerRoles?.join(',')}</dd>
      <dd data-testid="showRegister">{String(config.showRegister)}</dd>
      <dd data-testid="branchUrl">{config.branchUrl ?? 'undefined'}</dd>
    </dl>
  )
}

const renderProvider = (props: Omit<AuthProviderProps, 'children'> = {}) =>
  renderWithProviders(
    <AuthProvider {...props}>
      <ConfigProbe />
    </AuthProvider>,
  )

describe('AuthProvider', () => {
  it('exposes the default config', () => {
    renderProvider()

    expect(screen.getByTestId('defaultPath')).toHaveTextContent('/')
    expect(screen.getByTestId('registerDefaultRole')).toHaveTextContent('customer')
    expect(screen.getByTestId('registerRoles')).toHaveTextContent('customer,rider')
    expect(screen.getByTestId('showRegister')).toHaveTextContent('true')
    expect(screen.getByTestId('branchUrl')).toHaveTextContent('undefined')
  })

  it('exposes the overridden config', () => {
    renderProvider({
      defaultPath: '/home',
      branchUrl: '/branch',
      registerDefaultRole: 'rider',
      registerRoles: ['rider'],
      showRegister: false,
    })

    expect(screen.getByTestId('defaultPath')).toHaveTextContent('/home')
    expect(screen.getByTestId('branchUrl')).toHaveTextContent('/branch')
    expect(screen.getByTestId('registerDefaultRole')).toHaveTextContent('rider')
    expect(screen.getByTestId('registerRoles')).toHaveTextContent('rider')
    expect(screen.getByTestId('showRegister')).toHaveTextContent('false')
  })
})
