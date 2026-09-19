import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOfferCountdown } from '../useOfferCountdown'

describe('useOfferCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down every second', () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString()
    const { result } = renderHook(() => useOfferCountdown(expiresAt, vi.fn()))

    expect(result.current).toBe(5)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toBe(3)
  })

  it('calls onExpire exactly once when the countdown reaches zero', () => {
    const onExpire = vi.fn()
    const expiresAt = new Date(Date.now() + 2000).toISOString()
    renderHook(() => useOfferCountdown(expiresAt, onExpire))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('stays at zero without expiring when there is no deadline', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useOfferCountdown(null, onExpire))

    expect(result.current).toBe(0)
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('uses the latest onExpire callback without restarting the timer', () => {
    const first = vi.fn()
    const second = vi.fn()
    const expiresAt = new Date(Date.now() + 2000).toISOString()
    const { rerender } = renderHook(({ cb }) => useOfferCountdown(expiresAt, cb), {
      initialProps: { cb: first },
    })

    rerender({ cb: second })
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
