import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AuthLayout } from '../index'

const renderLayout = (route: string, props = {}) =>
  renderWithProviders(
    <Routes>
      <Route path={route} element={<AuthLayout {...props} />}>
        <Route index element={<span data-testid="content">content</span>} />
      </Route>
    </Routes>,
    { route },
  )

describe('AuthLayout', () => {
  it('shows the logo on the login route when both variants are provided', () => {
    renderLayout('/login', { logoLight: '/light.svg', logoDark: '/dark.svg' })

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByAltText('UNaHur')).toBeInTheDocument()
    expect(screen.queryByLabelText('Volver')).not.toBeInTheDocument()
  })

  it('shows the back button away from the login route', () => {
    renderLayout('/register', { logoLight: '/light.svg', logoDark: '/dark.svg' })

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByLabelText('Volver')).toBeInTheDocument()
    expect(screen.queryByAltText('UNaHur')).not.toBeInTheDocument()
  })

  it('falls back to the back button on login when no logo is provided', () => {
    renderLayout('/login')

    expect(screen.getByLabelText('Volver')).toBeInTheDocument()
    expect(screen.queryByAltText('UNaHur')).not.toBeInTheDocument()
  })
})
