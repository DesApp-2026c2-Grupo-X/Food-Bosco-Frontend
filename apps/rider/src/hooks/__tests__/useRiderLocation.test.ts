import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRiderLocation } from '../useRiderLocation'
import { useRiderStore } from '../../stores/riderStore'

type Success = (position: { coords: { latitude: number; longitude: number } }) => void
type Failure = () => void

const geolocation = navigator as Navigator & { geolocation?: unknown }

describe('useRiderLocation', () => {
  const watchPosition = vi.fn()
  const clearWatch = vi.fn()

  beforeEach(() => {
    watchPosition.mockReset()
    clearWatch.mockReset()
    useRiderStore.setState({ isOnline: true, location: null })
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition, clearWatch },
    })
  })

  it('pushes every position to the store and the API', () => {
    const updateLocation = vi.fn()
    watchPosition.mockReturnValue(42)

    renderHook(() => useRiderLocation(true, updateLocation))

    expect(watchPosition).toHaveBeenCalledTimes(1)
    const onSuccess = watchPosition.mock.calls[0]?.[0] as Success

    act(() => onSuccess({ coords: { latitude: -34.6, longitude: -58.4 } }))

    expect(updateLocation).toHaveBeenCalledWith(-34.6, -58.4)
    expect(useRiderStore.getState().location).toEqual({ latitude: -34.6, longitude: -58.4 })
  })

  it('reports an error when the position cannot be read', async () => {
    watchPosition.mockReturnValue(7)
    const { result } = renderHook(() => useRiderLocation(true, vi.fn()))

    const onError = watchPosition.mock.calls[0]?.[1] as Failure
    act(() => onError())

    await waitFor(() => expect(result.current).toBe('Ubicación no disponible'))
  })

  it('does nothing while disabled', () => {
    renderHook(() => useRiderLocation(false, vi.fn()))
    expect(watchPosition).not.toHaveBeenCalled()
  })

  it('stops watching on unmount', () => {
    watchPosition.mockReturnValue(99)
    const { unmount } = renderHook(() => useRiderLocation(true, vi.fn()))
    unmount()
    expect(clearWatch).toHaveBeenCalledWith(99)
  })

  it('reports when geolocation is unavailable', async () => {
    delete geolocation.geolocation
    const { result } = renderHook(() => useRiderLocation(true, vi.fn()))
    await waitFor(() => expect(result.current).toBe('Geolocalización no disponible'))
  })
})
