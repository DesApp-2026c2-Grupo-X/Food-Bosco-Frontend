import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from '../SelectField'
import { renderWithProviders } from '@test/utils'

const options = [
  { value: 'a', label: 'Opción A' },
  { value: 'b', label: 'Opción B' },
]

describe('SelectField', () => {
  it('reports the selected value through onChange', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <SelectField value="" onChange={onChange} options={options} placeholder="Elegí" />,
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'b')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('renders the placeholder as a disabled empty option', () => {
    renderWithProviders(
      <SelectField value="" onChange={vi.fn()} options={options} placeholder="Elegí" />,
    )

    const placeholder = screen.getByRole('option', { name: 'Elegí' })
    expect(placeholder).toBeDisabled()
    expect(placeholder).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Opción A' })).toBeInTheDocument()
  })

  it('disables the select when requested', () => {
    renderWithProviders(<SelectField value="" onChange={vi.fn()} options={options} disabled />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
