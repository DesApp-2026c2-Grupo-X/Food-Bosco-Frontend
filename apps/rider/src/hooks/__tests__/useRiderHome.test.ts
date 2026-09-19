import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useRiderProfile, useTripOffers } from '@repo/api'
import { useRiderHome } from '../useRiderHome'
import { useRiderStore } from '../../stores/riderStore'

const { playIncomingSound } = vi.hoisted(() => ({ playIncomingSound: vi.fn() }))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  playIncomingSound,
}))

vi.mock('@repo/api', () => ({
  useRiderProfile: vi.fn(),
  useActiveTrip: vi.fn(),
  useTripOffers: vi.fn(),
}))

const offersMock = useTripOffers as unknown as Mock
const tripMock = useActiveTrip as unknown as Mock
const profileMock = useRiderProfile as unknown as Mock

const offer = {
  id: 'of1',
  orderCount: 1,
  distanceKm: 3,
  estimatedMinutes: 12,
  estimatedEarnings: 900,
  expiresAt: null,
}

const setup = (offerValue: unknown = offer) => {
  useRiderStore.setState({ isOnline: true, location: null })
  const accept = vi.fn().mockResolvedValue(undefined)
  const reject = vi.fn().mockResolvedValue(undefined)
  offersMock.mockReturnValue({
    offer: offerValue,
    isLoading: false,
    isMutating: false,
    accept,
    reject,
  })
  tripMock.mockReturnValue({ trip: null, isLoading: false })
  profileMock.mockReturnValue({ updateLocation: vi.fn() })
  return { accept, reject }
}

describe('useRiderHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the incoming offer and plays a sound for new offers', () => {
    setup()
    const { result } = renderHook(() => useRiderHome())
    expect(result.current.visibleOffer?.id).toBe('of1')
    expect(playIncomingSound).toHaveBeenCalled()
  })

  it('accepts the current offer', async () => {
    const { accept } = setup()
    const { result } = renderHook(() => useRiderHome())

    await act(async () => {
      await result.current.handleAccept()
    })

    expect(accept).toHaveBeenCalledWith('of1')
  })

  it('dismisses and rejects the offer', async () => {
    const { reject } = setup()
    const { result } = renderHook(() => useRiderHome())

    act(() => {
      result.current.handleReject()
    })

    expect(result.current.visibleOffer).toBeNull()
    expect(reject).toHaveBeenCalledWith('of1')
  })

  it('does not expose an offer when there is none', () => {
    setup(null)
    const { result } = renderHook(() => useRiderHome())
    expect(result.current.visibleOffer).toBeNull()
    expect(playIncomingSound).not.toHaveBeenCalled()
  })
})
