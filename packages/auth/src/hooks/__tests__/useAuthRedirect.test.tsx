import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { UserRole } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { AuthProvider, type AuthAppConfig } from '../../index'
import { useAuthRedirect } from '../useAuthRedirect'

interface HarnessProps {
  role?: UserRole
  seedFrom?: string
}

const RedirectHarness = ({ role, seedFrom }: HarnessProps) => {
  const navigate = useNavigate()
  const redirect = useAuthRedirect()
  const { pathname } = useLocation()

  return (
    <>
      {seedFrom ? (
        <button
          type="button"
          onClick={() => navigate('/login', { state: { from: { pathname: seedFrom } } })}
        >
          seed
        </button>
      ) : null}
      <button type="button" onClick={() => redirect(role)}>
        go
      </button>
      <span data-testid="path">{pathname}</span>
    </>
  )
}

const renderRedirect = (config: AuthAppConfig = {}, props: HarnessProps = {}) =>
  renderWithProviders(
    <AuthProvider {...config}>
      <Routes>
        <Route path="*" element={<RedirectHarness {...props} />} />
      </Routes>
    </AuthProvider>,
    { route: '/login' },
  )

describe('useAuthRedirect', () => {
  it.each<UserRole>(['customer', 'branch_admin', 'super_admin', 'rider'])(
    'navigates internally for %s instead of jumping to another app',
    async (role) => {
      renderRedirect(
        {
          defaultPath: '/home',
          branchUrl: 'http://branch.example',
          adminUrl: 'http://admin.example',
          riderUrl: 'http://rider.example',
        },
        { role },
      )
      await userEvent.click(screen.getByRole('button', { name: 'go' }))

      expect(screen.getByTestId('path')).toHaveTextContent('/home')
    },
  )

  it('gives redirectByRole precedence over the internal navigation', async () => {
    const redirectByRole = vi.fn()
    renderRedirect({ redirectByRole, defaultPath: '/home' }, { role: 'branch_admin' })
    await userEvent.click(screen.getByRole('button', { name: 'go' }))

    expect(redirectByRole).toHaveBeenCalledWith('branch_admin')
    expect(screen.getByTestId('path')).toHaveTextContent('/login')
  })

  it('honours location.state.from.pathname', async () => {
    renderRedirect({ defaultPath: '/home' }, { seedFrom: '/cart' })
    await userEvent.click(screen.getByRole('button', { name: 'seed' }))
    await userEvent.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/cart')
  })

  it('ignores a from path of /login and falls back to defaultPath', async () => {
    renderRedirect({ defaultPath: '/home' }, { seedFrom: '/login' })
    await userEvent.click(screen.getByRole('button', { name: 'seed' }))
    await userEvent.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/home')
  })

  it('falls back to the configured defaultPath', async () => {
    renderRedirect({ defaultPath: '/home' }, { role: 'customer' })
    await userEvent.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/home')
  })

  it('falls back to the root path when no default is configured', async () => {
    renderRedirect({}, { role: 'customer' })
    await userEvent.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })
})
