import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useActiveTrip } from '../useActiveTrip'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const trip = (id: string, status: string) => ({
  id,
  riderId: 'r1',
  status,
  orders: [],
  distanceKm: 1,
  estimatedMinutes: 5,
  estimatedEarnings: 500,
  earnings: null,
  startedAt: null,
  completedAt: null,
  expiresAt: null,
})

const setup = (trips: unknown[]) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'MyTrips') return { data: { myTrips: trips } }
    if (operation.operationName === 'MarkOrderPickup') return { data: { markOrderPickup: {} } }
    if (operation.operationName === 'MarkOrderDelivered')
      return { data: { markOrderDelivered: {} } }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useActiveTrip(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useActiveTrip', () => {
  it('selects the active trip among all trips', async () => {
    const { result } = setup([trip('t-completed', 'COMPLETED'), trip('t-active', 'ACTIVE')])
    await waitFor(() => expect(result.current.trip).not.toBeNull())
    expect(result.current.trip?.id).toBe('t-active')
  })

  it('is null when no trip is active', async () => {
    const { result } = setup([trip('t1', 'COMPLETED')])
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.trip).toBeNull()
  })

  it('pickup sends trip and order ids and refetches trips', async () => {
    const { testClient, result } = setup([trip('t-active', 'ACTIVE')])
    await waitFor(() => expect(result.current.trip).not.toBeNull())

    await act(async () => {
      await result.current.pickup('o1')
    })

    expect(operationVariables(testClient.lastRequest('MarkOrderPickup'))).toEqual({
      tripId: 't-active',
      orderId: 'o1',
    })
    expect(testClient.requestsByName('MyTrips').length).toBeGreaterThan(1)
  })

  it('deliver sends trip and order ids', async () => {
    const { testClient, result } = setup([trip('t-active', 'ACTIVE')])
    await waitFor(() => expect(result.current.trip).not.toBeNull())

    await act(async () => {
      await result.current.deliver('o2')
    })

    expect(operationVariables(testClient.lastRequest('MarkOrderDelivered'))).toEqual({
      tripId: 't-active',
      orderId: 'o2',
    })
  })

  it('does not mutate when there is no active trip', async () => {
    const { testClient, result } = setup([])
    await act(async () => {
      await result.current.pickup('o1')
      await result.current.deliver('o1')
    })
    expect(testClient.requestsByName('MarkOrderPickup')).toHaveLength(0)
    expect(testClient.requestsByName('MarkOrderDelivered')).toHaveLength(0)
  })
})
