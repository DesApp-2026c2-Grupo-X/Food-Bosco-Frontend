import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartButton } from '../index'
import { renderWithProviders } from '@test/utils'

describe('CartButton', () => {
  it('hides the badge when the count is zero', () => {
    renderWithProviders(<CartButton count={0} />)

    expect(screen.getByRole('button', { name: 'Ver carrito' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows the count badge and fires onClick', async () => {
    const onClick = vi.fn()
    renderWithProviders(<CartButton count={3} onClick={onClick} />)

    expect(screen.getByText('3')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver carrito' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
