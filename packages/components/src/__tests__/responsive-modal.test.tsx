import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResponsiveModal } from '../ResponsiveModal'
import { useIsDesktop } from '../useIsDesktop'
import { renderWithProviders } from '@test/utils'

vi.mock('../useIsDesktop', () => ({ useIsDesktop: vi.fn() }))

const mockedIsDesktop = vi.mocked(useIsDesktop)

beforeEach(() => {
  mockedIsDesktop.mockReturnValue(false)
})

describe('ResponsiveModal', () => {
  it('renders children when open', () => {
    renderWithProviders(
      <ResponsiveModal open onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )

    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('does not render children when closed', () => {
    renderWithProviders(
      <ResponsiveModal open={false} onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('uses the drawer branch on mobile', () => {
    renderWithProviders(
      <ResponsiveModal open onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )

    expect(document.querySelector('.chakra-drawer__content')).not.toBeNull()
    expect(document.querySelector('.chakra-dialog__content')).toBeNull()
  })

  it('uses the dialog branch on desktop', () => {
    mockedIsDesktop.mockReturnValue(true)
    renderWithProviders(
      <ResponsiveModal open onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )

    expect(document.querySelector('.chakra-dialog__content')).not.toBeNull()
    expect(document.querySelector('.chakra-drawer__content')).toBeNull()
  })

  it('hides the close trigger when not closable', () => {
    const { rerender } = renderWithProviders(
      <ResponsiveModal open onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )
    expect(document.querySelector('[data-part="close-trigger"]')).not.toBeNull()

    rerender(
      <ResponsiveModal open closable={false} onClose={vi.fn()}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )
    expect(document.querySelector('[data-part="close-trigger"]')).toBeNull()
  })

  it('calls onClose when the open state changes to closed', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <ResponsiveModal open onClose={onClose}>
        <div>Contenido</div>
      </ResponsiveModal>,
    )

    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
