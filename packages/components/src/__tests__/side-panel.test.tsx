import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SidePanel } from '../SidePanel'
import { renderWithProviders } from '@test/utils'

const closeTrigger = () => document.querySelector('[data-part="close-trigger"]') as HTMLElement

describe('SidePanel', () => {
  it('renders the title, header, body and footer when open', () => {
    renderWithProviders(
      <SidePanel
        open
        onClose={vi.fn()}
        title="Detalle"
        header={<div>Encabezado</div>}
        footer={<div>Pie</div>}
      >
        <div>Cuerpo</div>
      </SidePanel>,
    )

    expect(screen.getByText('Detalle')).toBeInTheDocument()
    expect(screen.getByText('Encabezado')).toBeInTheDocument()
    expect(screen.getByText('Cuerpo')).toBeInTheDocument()
    expect(screen.getByText('Pie')).toBeInTheDocument()
  })

  it('does not render its content when closed', () => {
    renderWithProviders(
      <SidePanel open={false} onClose={vi.fn()} title="Detalle">
        <div>Cuerpo</div>
      </SidePanel>,
    )

    expect(screen.queryByText('Detalle')).not.toBeInTheDocument()
    expect(screen.queryByText('Cuerpo')).not.toBeInTheDocument()
  })

  it('calls onClose when the close trigger is used', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <SidePanel open onClose={onClose} title="Detalle">
        <div>Cuerpo</div>
      </SidePanel>,
    )

    fireEvent.click(closeTrigger())
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })
})
