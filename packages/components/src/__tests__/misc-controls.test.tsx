import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RowEditToggleActions } from '../RowEditToggleActions'
import { SwitchRow } from '../SwitchRow'
import { renderWithProviders } from '@test/utils'

describe('RowEditToggleActions', () => {
  it('renders the read only text without actions', () => {
    renderWithProviders(
      <RowEditToggleActions readOnlyText="Solo lectura" onEdit={vi.fn()} onToggle={vi.fn()} />,
    )

    expect(screen.getByText('Solo lectura')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('calls onEdit when the edit button is pressed', async () => {
    const onEdit = vi.fn()
    renderWithProviders(<RowEditToggleActions onEdit={onEdit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('renders the extra slot', () => {
    renderWithProviders(<RowEditToggleActions extra={<span>Extra</span>} />)

    expect(screen.getByText('Extra')).toBeInTheDocument()
  })

  it('toggles the switch', async () => {
    const onToggle = vi.fn()
    renderWithProviders(
      <RowEditToggleActions checked={false} onToggle={onToggle} ariaLabel="Disponible" />,
    )

    await userEvent.click(screen.getByLabelText('Disponible'))

    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('disables the switch', () => {
    renderWithProviders(
      <RowEditToggleActions checked onToggle={vi.fn()} disabled ariaLabel="Disponible" />,
    )

    expect(screen.getByRole('checkbox', { name: 'Disponible' })).toBeDisabled()
  })
})

describe('SwitchRow', () => {
  it('renders the label and description and toggles', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <SwitchRow
        label="Disponible"
        checked={false}
        onChange={onChange}
        description="Visible en el catálogo"
      />,
    )

    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('Visible en el catálogo')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Disponible'))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('uses the custom aria label when provided', () => {
    renderWithProviders(
      <SwitchRow label="Visible" ariaLabel="Mostrar" checked={false} onChange={vi.fn()} />,
    )

    expect(screen.getByRole('checkbox', { name: 'Mostrar' })).toBeInTheDocument()
  })

  it('falls back to the label as aria label', () => {
    renderWithProviders(<SwitchRow label="Visible" checked={false} onChange={vi.fn()} />)

    expect(screen.getByRole('checkbox', { name: 'Visible' })).toBeInTheDocument()
  })

  it('disables the switch', () => {
    renderWithProviders(<SwitchRow label="Visible" checked={false} onChange={vi.fn()} disabled />)

    expect(screen.getByRole('checkbox', { name: 'Visible' })).toBeDisabled()
  })
})
