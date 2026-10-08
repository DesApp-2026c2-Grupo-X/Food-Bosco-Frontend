import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PasswordInput } from '../PasswordInput'
import { PasswordField } from '../PasswordField'
import { renderWithProviders } from '@test/utils'

describe('PasswordInput', () => {
  it('toggles between password and text with the matching aria-label', async () => {
    renderWithProviders(<PasswordInput placeholder="Contraseña" />)

    const input = screen.getByPlaceholderText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})

describe('PasswordField', () => {
  it('renders the label, wrapper and error state', () => {
    renderWithProviders(
      <PasswordField label="Contraseña" placeholder="Contraseña" invalid errorText="Requerido" />,
    )

    expect(screen.getByText('Contraseña')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Contraseña')).toHaveAttribute('type', 'password')
    expect(screen.getByText('Requerido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
  })

  it('forwards the value change to onChange', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <PasswordField label="Contraseña" placeholder="Contraseña" onChange={onChange} />,
    )

    await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'a')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
