import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AddressFlowHeader } from '../AddressFlowHeader'
import { renderWithProviders } from '@test/utils'

describe('AddressFlowHeader', () => {
  it('renders the title, description and the geo icon when there is no back handler', () => {
    const { container } = renderWithProviders(
      <AddressFlowHeader title="Título" description="Descripción" />,
    )

    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument()
    expect(screen.getByText('Descripción')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Volver' })).not.toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders a back button that calls the handler', async () => {
    const onBack = vi.fn()
    renderWithProviders(
      <AddressFlowHeader title="Título" description="Descripción" onBack={onBack} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
