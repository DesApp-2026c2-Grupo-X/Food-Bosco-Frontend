import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatPrice, type TripOffer } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { TripOfferCard } from '../index'

const priceText = (value: number) => formatPrice(value).replace(/\u00a0/g, ' ')

const offer: TripOffer = {
  id: 'of1',
  orderCount: 2,
  distanceKm: 5,
  estimatedMinutes: 18,
  estimatedEarnings: 1200,
  expiresAt: null,
}

describe('TripOfferCard', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the offer summary and estimated earnings', () => {
    renderWithProviders(<TripOfferCard offer={offer} onAccept={vi.fn()} onReject={vi.fn()} />)

    expect(screen.getByText('Nueva oferta de viaje')).toBeInTheDocument()
    expect(screen.getByText('2 órdenes · 5 km · ~18 min')).toBeInTheDocument()
    expect(screen.getByText(priceText(1200))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeInTheDocument()
  })

  it('uses the singular label for a single-order offer', () => {
    renderWithProviders(
      <TripOfferCard offer={{ ...offer, orderCount: 1 }} onAccept={vi.fn()} onReject={vi.fn()} />,
    )

    expect(screen.getByText('1 orden · 5 km · ~18 min')).toBeInTheDocument()
  })

  it('accepts and rejects through the callbacks', async () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    renderWithProviders(<TripOfferCard offer={offer} onAccept={onAccept} onReject={onReject} />)

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onReject).toHaveBeenCalledTimes(1)
  })

  it('disables reject while the offer is being accepted', () => {
    renderWithProviders(<TripOfferCard offer={offer} isLoading onAccept={vi.fn()} onReject={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled()
  })

  it('shows and updates the countdown while the offer is live', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
    const expiresAt = new Date(Date.now() + 65_000).toISOString()

    renderWithProviders(
      <TripOfferCard offer={{ ...offer, expiresAt }} onAccept={vi.fn()} onReject={vi.fn()} />,
    )

    expect(screen.getByText('1:05')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText('1:00')).toBeInTheDocument()
  })
})
