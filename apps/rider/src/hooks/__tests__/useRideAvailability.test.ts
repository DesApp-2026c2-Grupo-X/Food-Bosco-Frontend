import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useRiderProfile } from '@repo/api'
import { useRideAvailability } from '../useRideAvailability'
import { useRiderStore } from '../../stores/riderStore'

const { notifyError } = vi.hoisted(() => ({ notifyError: vi.fn() }))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  notifyError,
}))

vi.mock('@repo/api', () => ({
  useRiderProfile: vi.fn(),
  useActiveTrip: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock
const tripMock = useActiveTrip as unknown as Mock

const setup = (options: { isOnline?: boolean; trip?: unknown; setAvailability?: Mock } = {}) => {
  const setAvailability = options.setAvailability ?? vi.fn().mockResolvedValue(undefined)
  useRiderStore.setState({ isOnline: options.isOnline ?? true, location: null })
  profileMock.mockReturnValue({
    profile: null,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle: vi.fn(),
    setAvailability: setAvailability as never,
    updateLocation: vi.fn(),
  })
  tripMock.mockReturnValue({
    trip: (options.trip ?? null) as never,
    isLoading: false,
    isMutating: false,
    pickup: vi.fn(),
    deliver: vi.fn(),
  })
  return { setAvailability }
}

describe('useRideAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('optimistically disconnects and persists the change', async () => {
    const { setAvailability } = setup({ isOnline: true })
    const { result } = renderHook(() => useRideAvailability())

    await act(async () => {
      await result.current.onToggle()
    })

    expect(setAvailability).toHaveBeenCalledWith(false)
    expect(useRiderStore.getState().isOnline).toBe(false)
  })

  it('rolls back and notifies when the API fails', async () => {
    setup({
      isOnline: true,
      setAvailability: vi.fn().mockRejectedValue(new Error('boom')),
    })
    const { result } = renderHook(() => useRideAvailability())

    await act(async () => {
      await result.current.onToggle()
    })

    expect(useRiderStore.getState().isOnline).toBe(true)
    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'No pudimos actualizar tu disponibilidad' }),
    )
  })

  it('is locked and cannot toggle while a trip is in progress', async () => {
    const { setAvailability } = setup({ isOnline: true, trip: { id: 't1', status: 'ACTIVE' } })
    const { result } = renderHook(() => useRideAvailability())

    await waitFor(() => expect(result.current.locked).toBe(true))

    await act(async () => {
      await result.current.onToggle()
    })

    expect(setAvailability).not.toHaveBeenCalled()
    expect(useRiderStore.getState().isOnline).toBe(true)
  })
})
