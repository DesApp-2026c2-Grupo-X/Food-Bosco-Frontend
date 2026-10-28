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

  it('renders the placeholder as a selectable empty option', () => {
    renderWithProviders(
      <SelectField value="" onChange={vi.fn()} options={options} placeholder="Elegí" />,
    )

    const placeholder = screen.getByRole('option', { name: 'Elegí' })
    expect(placeholder).not.toBeDisabled()
    expect(placeholder).toHaveValue('')
    expect(screen.getByRole('option', { name: 'Opción A' })).toBeInTheDocument()
  })

  it('allows selecting another value and then going back to the placeholder', async () => {
    const onChange = vi.fn()
    const { rerender } = renderWithProviders(
      <SelectField value="" onChange={onChange} options={options} placeholder="Todas" />,
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'b')
    expect(onChange).toHaveBeenLastCalledWith('b')

    rerender(<SelectField value="b" onChange={onChange} options={options} placeholder="Todas" />)
    await userEvent.selectOptions(screen.getByRole('combobox'), '')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('disables the select when requested', () => {
    renderWithProviders(<SelectField value="" onChange={vi.fn()} options={options} disabled />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
