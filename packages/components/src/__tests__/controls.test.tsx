import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from '../QuantityStepper'
import { StatusToggleButton } from '../StatusToggleButton'
import { ToggleSwitch } from '../ToggleSwitch'
import { renderWithProviders } from '@test/utils'

describe('QuantityStepper', () => {
  it('increments and decrements around the current value', async () => {
    const onChange = vi.fn()
    renderWithProviders(<QuantityStepper value={3} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Agregar uno' }))
    expect(onChange).toHaveBeenCalledWith(4)

    await userEvent.click(screen.getByRole('button', { name: 'Quitar uno' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('disables decrement at the minimum', () => {
    renderWithProviders(<QuantityStepper value={1} onChange={vi.fn()} min={1} />)
    expect(screen.getByRole('button', { name: 'Quitar uno' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeEnabled()
  })

  it('disables increment at the maximum', () => {
    renderWithProviders(<QuantityStepper value={5} onChange={vi.fn()} max={5} />)
    expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeDisabled()
  })

  it('disables both controls when the whole stepper is disabled', () => {
    renderWithProviders(<QuantityStepper value={3} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Quitar uno' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Agregar uno' })).toBeDisabled()
  })
})

describe('StatusToggleButton', () => {
  it('shows the active label and triggers the toggle', async () => {
    const onToggle = vi.fn()
    renderWithProviders(
      <StatusToggleButton
        active
        onToggle={onToggle}
        activeLabel="Abierto"
        inactiveLabel="Cerrado"
        colorPalette="success"
      />,
    )

    const button = screen.getByRole('button', { name: 'Abierto' })
    await userEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('shows the inactive label when closed', () => {
    renderWithProviders(
      <StatusToggleButton
        active={false}
        onToggle={vi.fn()}
        activeLabel="Abierto"
        inactiveLabel="Cerrado"
      />,
    )
    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeInTheDocument()
  })

  it('does not toggle while disabled', async () => {
    const onToggle = vi.fn()
    renderWithProviders(
      <StatusToggleButton
        active
        onToggle={onToggle}
        activeLabel="Abierto"
        inactiveLabel="Cerrado"
        disabled
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Abierto' }))
    expect(onToggle).not.toHaveBeenCalled()
  })
})

describe('ToggleSwitch', () => {
  it('reports the next checked state', async () => {
    const onChange = vi.fn()
    renderWithProviders(<ToggleSwitch checked={false} onChange={onChange} ariaLabel="Disponible" />)

    await userEvent.click(screen.getByLabelText('Disponible'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('does not emit while disabled', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <ToggleSwitch checked={false} onChange={onChange} ariaLabel="Disponible" disabled />,
    )
    await userEvent.click(screen.getByLabelText('Disponible'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
