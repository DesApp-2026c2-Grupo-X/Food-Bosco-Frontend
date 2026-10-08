import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { AuthNotice } from '../index'

describe('AuthNotice', () => {
  it('renders the primary and secondary actions', () => {
    renderWithProviders(
      <AuthNotice
        title="Enlace no válido"
        description="El enlace de recuperación no es válido."
        primaryLabel="Solicitar nuevo enlace"
        primaryTo="/forgot-password"
        secondaryLabel="Volver al login"
        secondaryTo="/login"
      />,
    )

    expect(screen.getByText('Enlace no válido')).toBeInTheDocument()
    expect(screen.getByText('El enlace de recuperación no es válido.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Solicitar nuevo enlace' })).toHaveAttribute(
      'href',
      '/forgot-password',
    )
    expect(screen.getByRole('link', { name: 'Volver al login' })).toHaveAttribute('href', '/login')
  })

  it('omits the secondary action when it is not provided', () => {
    renderWithProviders(
      <AuthNotice title="Título" description="Descripción" primaryLabel="Ir" primaryTo="/login" />,
    )

    expect(screen.getByRole('link', { name: 'Ir' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('link', { name: 'Volver al login' })).not.toBeInTheDocument()
  })
})
