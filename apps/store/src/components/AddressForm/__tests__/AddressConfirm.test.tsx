import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AddressInput } from '@repo/domain'
import { AddressConfirm } from '../AddressConfirm'
import { renderWithProviders } from '@test/utils'

const input: AddressInput = {
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
}

const renderConfirm = (props: Partial<Parameters<typeof AddressConfirm>[0]> = {}) =>
  renderWithProviders(
    <AddressConfirm
      input={input}
      submitting={false}
      error={null}
      onConfirm={vi.fn()}
      onBack={vi.fn()}
      {...props}
    />,
  )

describe('AddressConfirm', () => {
  it('renders the map and the resolved address fields', () => {
    renderConfirm()

    expect(screen.getByLabelText('Ubicación de la dirección')).toBeInTheDocument()
    expect(screen.getByText('Casa')).toBeInTheDocument()
    expect(screen.getByText('Calle 1')).toBeInTheDocument()
    expect(screen.getByText('CABA · CP 1425')).toBeInTheDocument()
  })

  it('calls onConfirm and onBack', async () => {
    const onConfirm = vi.fn()
    const onBack = vi.fn()
    renderConfirm({ onConfirm, onBack })

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar dirección' }))
    await userEvent.click(screen.getByRole('button', { name: 'No es mi dirección' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('disables both actions while submitting', () => {
    renderConfirm({ submitting: true })

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    buttons.forEach((button) => expect(button).toBeDisabled())
  })

  it('surfaces the submission error', () => {
    renderConfirm({ error: 'No pudimos guardar la dirección.' })

    expect(screen.getByText('No pudimos guardar la dirección.')).toBeInTheDocument()
  })
})
