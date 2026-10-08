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

interface SetupOptions {
  offer?: unknown
  isMutating?: boolean
  accept?: Mock
  reject?: Mock
}

const setup = (options: SetupOptions = {}) => {
  useRiderStore.setState({ isOnline: true, location: null })
  const accept = options.accept ?? vi.fn().mockResolvedValue(undefined)
  const reject = options.reject ?? vi.fn().mockResolvedValue(undefined)
  offersMock.mockReturnValue({
    offer: 'offer' in options ? options.offer : offer,
    isLoading: false,
    isMutating: options.isMutating ?? false,
    accept,
    reject,
  })
  tripMock.mockReturnValue({ trip: null, isLoading: false })
  profileMock.mockReturnValue({ updateLocation: vi.fn() })
  return { accept, reject }
}

const offerReturn = (value: unknown, isMutating = false, accept = vi.fn(), reject = vi.fn()) => ({
  offer: value,
  isLoading: false,
  isMutating,
  accept,
  reject,
})

describe('useRiderHome edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ignores accept while a mutation is in flight', async () => {
    const { accept } = setup({ isMutating: true })
    const { result } = renderHook(() => useRiderHome())

    await act(async () => {
      await result.current.handleAccept()
    })

    expect(accept).not.toHaveBeenCalled()
  })

  it('does not replay the sound for the same offer id but does for a new one', () => {
    setup()
    const { rerender } = renderHook(() => useRiderHome())

    expect(playIncomingSound).toHaveBeenCalledTimes(1)

    offersMock.mockReturnValue(offerReturn({ ...offer }))
    rerender()

    expect(playIncomingSound).toHaveBeenCalledTimes(1)

    offersMock.mockReturnValue(offerReturn({ ...offer, id: 'of2' }))
    rerender()

    expect(playIncomingSound).toHaveBeenCalledTimes(2)
  })

  it('swallows the reject error and dismisses the offer', async () => {
    const { reject } = setup({ reject: vi.fn().mockRejectedValue(new Error('boom')) })
    const { result } = renderHook(() => useRiderHome())

    act(() => {
      result.current.handleReject()
    })

    expect(result.current.visibleOffer).toBeNull()
    expect(reject).toHaveBeenCalledWith('of1')
  })
})
