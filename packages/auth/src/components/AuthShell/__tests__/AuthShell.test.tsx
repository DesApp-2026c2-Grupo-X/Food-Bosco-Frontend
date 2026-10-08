import type { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AuthShell } from '../index'

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

interface ShellProps {
  image?: string
  leading?: ReactNode
}

const renderShell = ({ image, leading }: ShellProps = {}) =>
  renderWithProviders(
    <Routes>
      <Route element={<AuthShell image={image} leading={leading} />}>
        <Route index element={<span data-testid="content">content</span>} />
      </Route>
    </Routes>,
    { route: '/' },
  )

const originalMatchMedia = window.matchMedia

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: originalMatchMedia,
  })
})

describe('AuthShell', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  it('renders the decorative image and leading content on desktop', async () => {
    mockMatchMedia(true)
    renderShell({ image: 'https://example.com/bg.jpg', leading: <span>lead</span> })

    expect(await screen.findByAltText('Imagen decorativa')).toBeInTheDocument()
    expect(screen.getByText('lead')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('omits the decorative image on mobile', async () => {
    renderShell({ image: 'https://example.com/bg.jpg' })

    expect(await screen.findByTestId('content')).toBeInTheDocument()
    expect(screen.queryByAltText('Imagen decorativa')).not.toBeInTheDocument()
  })
})
