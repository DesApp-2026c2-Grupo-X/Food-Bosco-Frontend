import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useNearbyBranches } from '../useNearbyBranches'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawBranch = (id: string) => ({
  id,
  name: `Sucursal ${id}`,
  addressText: 'Calle 1',
  latitude: -34.6,
  longitude: -58.4,
  phone: '123',
  active: true,
  hours: [],
})

describe('useNearbyBranches', () => {
  it.each<[string, number | null | undefined, number | null | undefined]>([
    ['null lat', null, -58.4],
    ['undefined lat', undefined, -58.4],
    ['null lng', -34.6, null],
    ['undefined lng', -34.6, undefined],
  ])('does not query when coordinates are %s', async (_label, lat, lng) => {
    const testClient = createTestClient(() => ({ data: { nearbyBranches: [rawBranch('b1')] } }))
    renderHookWithProviders(() => useNearbyBranches(lat, lng), { client: testClient.client })

    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('NearbyBranches')).toHaveLength(0)
  })

  it('passes the coordinates as variables and maps the branches', async () => {
    const testClient = createTestClient(() => ({
      data: { nearbyBranches: [rawBranch('b1'), rawBranch('b2')] },
    }))

    const { result } = renderHookWithProviders(() => useNearbyBranches(-34.6, -58.4), {
      client: testClient.client,
    })

    await waitFor(() => expect(result.current.branches).toHaveLength(2))

    expect(operationVariables(testClient.lastRequest('NearbyBranches'))).toEqual({
      lat: -34.6,
      lng: -58.4,
    })
    expect(result.current.branches[0].name).toBe('Sucursal b1')
    expect(result.current.branches[0].longitude).toBe(-58.4)
  })

  it('returns an empty list when there are no branches', async () => {
    const testClient = createTestClient(() => ({ data: { nearbyBranches: [] } }))
    const { result } = renderHookWithProviders(() => useNearbyBranches(-34.6, -58.4), {
      client: testClient.client,
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.branches).toEqual([])
  })
})
