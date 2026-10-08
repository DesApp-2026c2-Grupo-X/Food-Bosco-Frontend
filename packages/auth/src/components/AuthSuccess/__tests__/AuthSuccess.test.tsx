import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AuthSuccess } from '../index'

describe('AuthSuccess', () => {
  it('renders the confirmation and the action link', () => {
    renderWithProviders(
      <AuthSuccess
        title="Contraseña actualizada correctamente"
        description="Ya podés iniciar sesión con tu nueva contraseña."
        buttonLabel="Iniciar sesión"
        to="/login"
      />,
    )

    expect(screen.getByText('Contraseña actualizada correctamente')).toBeInTheDocument()
    expect(screen.getByText('Ya podés iniciar sesión con tu nueva contraseña.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
  })
})
