import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { MobileRiderNavigation } from '../index'

const itemBoxClass = (label: string) =>
  (screen.getByText(label).closest('a')?.firstElementChild as HTMLElement).className

describe('MobileRiderNavigation', () => {
  it('renders the items with their paths', () => {
    renderWithProviders(<MobileRiderNavigation />, { route: '/' })

    expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Historial').closest('a')).toHaveAttribute('href', '/history')
    expect(screen.getByText('Perfil').closest('a')).toHaveAttribute('href', '/profile')
  })

  it('marks Inicio as active on the trip detail route', () => {
    renderWithProviders(<MobileRiderNavigation />, { route: '/trip/o1' })

    expect(itemBoxClass('Inicio')).not.toBe(itemBoxClass('Historial'))
    expect(itemBoxClass('Inicio')).not.toBe(itemBoxClass('Perfil'))
  })

  it('marks the matching item active per route', () => {
    const { unmount } = renderWithProviders(<MobileRiderNavigation />, { route: '/history' })
    expect(itemBoxClass('Historial')).not.toBe(itemBoxClass('Inicio'))
    unmount()

    renderWithProviders(<MobileRiderNavigation />, { route: '/profile' })
    expect(itemBoxClass('Perfil')).not.toBe(itemBoxClass('Inicio'))
  })
})
