import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocationButton } from '../index'
import { renderWithProviders } from '@test/utils'

describe('LocationButton', () => {
  it('shows the label and an accessible delivery address name', () => {
    renderWithProviders(<LocationButton label="Casa" onOpen={vi.fn()} />)

    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dirección de entrega: Casa' })).toBeInTheDocument()
  })

  it('opens the picker when clicked', async () => {
    const onOpen = vi.fn()
    renderWithProviders(<LocationButton label="Casa" onOpen={onOpen} />)

    await userEvent.click(screen.getByRole('button', { name: 'Dirección de entrega: Casa' }))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
