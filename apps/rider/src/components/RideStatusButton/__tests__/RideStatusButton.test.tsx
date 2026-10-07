import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRideAvailability } from '../../../hooks/useRideAvailability'
import { renderWithProviders } from '@test/utils'
import { RideStatusButton } from '../index'

vi.mock('../../../hooks/useRideAvailability', () => ({
  useRideAvailability: vi.fn(),
}))

const mockAvailability = (overrides: Partial<ReturnType<typeof useRideAvailability>> = {}) => {
  vi.mocked(useRideAvailability).mockReturnValue({
    available: true,
    onToggle: vi.fn(),
    isLoading: false,
    locked: false,
    ...overrides,
  })
}

describe('RideStatusButton', () => {
  beforeEach(() => {
    mockAvailability()
  })

  it('shows the connected label when the rider is available', () => {
    renderWithProviders(<RideStatusButton />)

    expect(screen.getByRole('button', { name: 'Conectado' })).toBeEnabled()
  })

  it('shows the disconnected label when the rider is unavailable', () => {
    mockAvailability({ available: false })
    renderWithProviders(<RideStatusButton />)

    expect(screen.getByRole('button', { name: 'Desconectado' })).toBeInTheDocument()
  })

  it('toggles availability on click', async () => {
    const onToggle = vi.fn()
    mockAvailability({ onToggle })
    renderWithProviders(<RideStatusButton />)

    await userEvent.click(screen.getByRole('button', { name: 'Conectado' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('is disabled with a hint while a trip is in progress', () => {
    mockAvailability({ locked: true })
    renderWithProviders(<RideStatusButton />)

    const button = screen.getByRole('button', { name: 'Conectado' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title', 'No podés desconectarte con un viaje en curso')
  })
})
