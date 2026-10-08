import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@repo/api'
import { useLogout } from '../useLogout'

const LogoutHarness = () => {
  const logout = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <>
      <button type="button" onClick={logout}>
        logout
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        back
      </button>
      <span data-testid="path">{pathname}</span>
    </>
  )
}

describe('useLogout', () => {
  beforeEach(() => {
    useAuthStore.setState({ logout: vi.fn() })
  })

  it('clears the session and replaces the current entry with the login route', async () => {
    render(
      <MemoryRouter initialEntries={['/origin', '/profile']} initialIndex={1}>
        <Routes>
          <Route path="*" element={<LogoutHarness />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('path')).toHaveTextContent('/profile')

    await userEvent.click(screen.getByRole('button', { name: 'logout' }))

    expect(useAuthStore.getState().logout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('path')).toHaveTextContent('/login')

    await userEvent.click(screen.getByRole('button', { name: 'back' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/origin')
  })
})
