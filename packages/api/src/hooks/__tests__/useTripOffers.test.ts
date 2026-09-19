import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTripOffers } from '../useTripOffers'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOffer = {
  id: 'of1',
  orderCount: 2,
  distanceKm: 5,
  estimatedMinutes: 20,
  estimatedEarnings: 1500,
  expiresAt: null,
}

const setup = (enabled = true) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'TripOffers') return { data: { tripOffers: [rawOffer] } }
    if (operation.operationName === 'MyTrips') return { data: { myTrips: [] } }
    if (operation.operationName === 'AcceptTripOffer') return { data: { acceptTripOffer: {} } }
    if (operation.operationName === 'RejectTripOffer') return { data: { rejectTripOffer: true } }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useTripOffers(enabled), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useTripOffers', () => {
  it('exposes the first available offer mapped to the domain model', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.offer).not.toBeNull())
    expect(result.current.offer).toEqual({
      id: 'of1',
      orderCount: 2,
      distanceKm: 5,
      estimatedMinutes: 20,
      estimatedEarnings: 1500,
      expiresAt: null,
    })
  })

  it('does not query offers while disabled', async () => {
    const { testClient } = setup(false)
    await act(async () => {
      await Promise.resolve()
    })
    expect(testClient.requestsByName('TripOffers')).toHaveLength(0)
  })

  it('accept sends the offer id and refetches trips and offers', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.offer).not.toBeNull())

    await act(async () => {
      await result.current.accept('of1')
    })

    expect(operationVariables(testClient.lastRequest('AcceptTripOffer'))).toEqual({
      offerId: 'of1',
    })
    expect(testClient.requestsByName('TripOffers').length).toBeGreaterThan(1)
  })

  it('reject sends the offer id and refetches offers', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.offer).not.toBeNull())

    await act(async () => {
      await result.current.reject('of1')
    })

    expect(operationVariables(testClient.lastRequest('RejectTripOffer'))).toEqual({
      offerId: 'of1',
    })
    expect(testClient.requestsByName('TripOffers').length).toBeGreaterThan(1)
  })

  it('returns no offer when the API list is empty', async () => {
    const testClient = createTestClient(() => ({ data: { tripOffers: [] } }))
    const { result } = renderHookWithProviders(() => useTripOffers(true), {
      client: testClient.client,
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.offer).toBeNull()
  })
})
