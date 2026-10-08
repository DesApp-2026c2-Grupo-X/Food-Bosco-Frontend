import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { RiderHeader } from '../index'
import { HeaderActions } from '../HeaderActions'

vi.mock('../../RideStatusButton', () => ({
  RideStatusButton: () => <div>Estado del viaje</div>,
}))

const navLink = (label: string) => screen.getByText(label).closest('a') as HTMLAnchorElement

describe('RiderHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the desktop navigation with its paths', () => {
    renderWithProviders(<RiderHeader />, { route: '/' })

    expect(navLink('Inicio')).toHaveAttribute('href', '/')
    expect(navLink('Historial')).toHaveAttribute('href', '/history')
    expect(navLink('Perfil')).toHaveAttribute('href', '/profile')
  })

  it('marks Inicio as active on the home route', () => {
    renderWithProviders(<RiderHeader />, { route: '/' })

    expect(navLink('Inicio').className).not.toBe(navLink('Historial').className)
    expect(navLink('Inicio').className).not.toBe(navLink('Perfil').className)
  })

  it('marks Inicio as active on the trip detail route', () => {
    renderWithProviders(<RiderHeader />, { route: '/trip/o1' })

    expect(navLink('Inicio').className).not.toBe(navLink('Historial').className)
    expect(navLink('Inicio').className).not.toBe(navLink('Perfil').className)
  })

  it('links the logo to the home route', () => {
    renderWithProviders(<RiderHeader />, { route: '/history' })

    expect(screen.getByLabelText('Ir al inicio')).toHaveAttribute('href', '/')
  })

  it('renders the ride status button in the header actions', () => {
    renderWithProviders(<RiderHeader />, { route: '/' })

    expect(screen.getByText('Estado del viaje')).toBeInTheDocument()
  })
})

describe('HeaderActions', () => {
  it('renders the ride status control and the profile shortcut', () => {
    renderWithProviders(<HeaderActions />, { route: '/' })

    expect(screen.getByText('Estado del viaje')).toBeInTheDocument()
    expect(screen.getByLabelText('Perfil')).toHaveAttribute('href', '/profile')
  })
})
