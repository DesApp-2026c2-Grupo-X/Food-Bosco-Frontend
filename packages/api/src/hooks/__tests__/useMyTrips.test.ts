import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMyTrips } from '../useMyTrips'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawTrip = (id: string, status = 'ACTIVE') => ({
  id,
  riderId: 'r1',
  status,
  orders: [],
  distanceKm: 1.5,
  estimatedMinutes: 5,
  estimatedEarnings: 500,
  earnings: null,
  startedAt: null,
  completedAt: null,
  expiresAt: null,
})

describe('useMyTrips', () => {
  it('maps the myTrips list', async () => {
    const testClient = createTestClient(() => ({
      data: { myTrips: [rawTrip('t1'), rawTrip('t2', 'COMPLETED')] },
    }))

    const { result } = renderHookWithProviders(() => useMyTrips(), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.trips).toHaveLength(2))

    expect(result.current.trips[0].id).toBe('t1')
    expect(result.current.trips[0].distanceKm).toBe(1.5)
    expect(result.current.trips[1].status).toBe('COMPLETED')
  })

  it('returns an empty list when there are no trips', async () => {
    const testClient = createTestClient(() => ({ data: { myTrips: [] } }))
    const { result } = renderHookWithProviders(() => useMyTrips(), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.trips).toEqual([])
  })
})
