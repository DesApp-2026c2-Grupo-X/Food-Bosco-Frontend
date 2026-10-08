import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { SegmentedChoice } from '../index'

const OPTIONS = [
  { value: 'customer', label: 'Cliente' },
  { value: 'rider', label: 'Repartidor' },
]

describe('SegmentedChoice', () => {
  it('renders every option', () => {
    renderWithProviders(<SegmentedChoice value="customer" onChange={vi.fn()} options={OPTIONS} />)

    expect(screen.getByRole('button', { name: 'Cliente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Repartidor' })).toBeInTheDocument()
  })

  it('calls onChange with the selected value', async () => {
    const onChange = vi.fn()
    renderWithProviders(<SegmentedChoice value="customer" onChange={onChange} options={OPTIONS} />)

    await userEvent.click(screen.getByRole('button', { name: 'Repartidor' }))

    expect(onChange).toHaveBeenCalledWith('rider')
  })
})
