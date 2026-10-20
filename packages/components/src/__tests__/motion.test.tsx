import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PageTransition } from '../PageTransition'
import { Reveal } from '../Reveal'
import { renderWithProviders } from '@test/utils'

const matchMedia = (reduced: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

describe('Reveal', () => {
  it('muestra el contenido cuando el movimiento está reducido', () => {
    vi.stubGlobal('matchMedia', matchMedia(true))

    renderWithProviders(
      <Reveal>
        <span>Contenido visible</span>
      </Reveal>,
    )

    expect(screen.getByText('Contenido visible')).toBeVisible()

    vi.unstubAllGlobals()
  })
})

describe('PageTransition', () => {
  it('renderiza el contenido de la página', () => {
    renderWithProviders(
      <PageTransition>
        <span>Página</span>
      </PageTransition>,
    )

    expect(screen.getByText('Página')).toBeInTheDocument()
  })
})
