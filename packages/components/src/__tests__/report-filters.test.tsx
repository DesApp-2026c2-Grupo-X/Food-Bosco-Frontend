import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { ReportFilters } from '../ReportFilters'
import type { ReportFiltersProps } from '../ReportFilters/types'

const branchOptions = [{ value: 'b1', label: 'Centro' }]
const statusOptions = [{ value: 'DELIVERED', label: 'Entregado' }]

const render = (overrides: Partial<ReportFiltersProps> = {}) =>
  renderWithProviders(
    <ReportFilters
      preset="month"
      onPresetChange={vi.fn()}
      from=""
      to=""
      onFromChange={vi.fn()}
      onToChange={vi.fn()}
      {...overrides}
    />,
  )

describe('ReportFilters', () => {
  it('emite el cambio de período', async () => {
    const onPresetChange = vi.fn()
    render({ onPresetChange })

    await userEvent.selectOptions(screen.getByRole('combobox'), 'day')

    expect(onPresetChange).toHaveBeenCalledWith('day')
  })

  it('muestra los inputs de fecha con min y max solo en custom', () => {
    const { container, unmount } = render({
      preset: 'custom',
      from: '2025-01-01',
      to: '2025-01-31',
    })
    const inputs = container.querySelectorAll('input[type="date"]')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('2025-01-01')
    expect(inputs[0]).toHaveAttribute('max', '2025-01-31')
    expect(inputs[1]).toHaveValue('2025-01-31')
    expect(inputs[1]).toHaveAttribute('min', '2025-01-01')
    unmount()

    const { container: plain } = render()
    expect(plain.querySelectorAll('input[type="date"]')).toHaveLength(0)
  })

  it('muestra los filtros de sucursal y estado solo cuando se proveen', () => {
    const { unmount } = render()
    expect(screen.queryByText('Sucursal')).not.toBeInTheDocument()
    expect(screen.queryByText('Estado')).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    unmount()

    render({
      branches: branchOptions,
      onBranchChange: vi.fn(),
      statusOptions,
      onStatusChange: vi.fn(),
    })
    expect(screen.getByText('Sucursal')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(3)
    expect(screen.getByRole('option', { name: 'Centro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Entregado' })).toBeInTheDocument()
  })

  it('emite los cambios de fecha, sucursal y estado', async () => {
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    const onBranchChange = vi.fn()
    const onStatusChange = vi.fn()
    const { container } = render({
      preset: 'custom',
      from: '2025-01-01',
      to: '2025-01-31',
      onFromChange,
      onToChange,
      branches: branchOptions,
      onBranchChange,
      statusOptions,
      onStatusChange,
    })

    const inputs = container.querySelectorAll('input[type="date"]')
    fireEvent.change(inputs[0] as HTMLElement, { target: { value: '2025-02-01' } })
    fireEvent.change(inputs[1] as HTMLElement, { target: { value: '2025-02-28' } })
    expect(onFromChange).toHaveBeenCalledWith('2025-02-01')
    expect(onToChange).toHaveBeenCalledWith('2025-02-28')

    const comboboxes = screen.getAllByRole('combobox')
    await userEvent.selectOptions(comboboxes[1] as HTMLElement, 'b1')
    expect(onBranchChange).toHaveBeenCalledWith('b1')

    await userEvent.selectOptions(comboboxes[2] as HTMLElement, 'DELIVERED')
    expect(onStatusChange).toHaveBeenCalledWith('DELIVERED')
  })
})
