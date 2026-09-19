import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRiderProfile } from '../useRiderProfile'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawRider = {
  id: 'r1',
  userId: 'u1',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '123',
  available: true,
  vehicle: { type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' },
  currentLocation: { latitude: -34.6, longitude: -58.4 },
}

const setup = () => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'RiderProfile':
        return { data: { riderProfile: rawRider } }
      case 'UpdateRiderProfile':
        return { data: { updateRiderProfile: rawRider } }
      case 'UpdateRiderVehicle':
        return { data: { updateRiderVehicle: rawRider } }
      case 'SetRiderAvailability':
        return { data: { setRiderAvailability: rawRider } }
      case 'UpdateRiderLocation':
        return { data: { updateRiderLocation: rawRider } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useRiderProfile(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useRiderProfile', () => {
  it('maps the rider profile', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.profile).not.toBeNull())
    expect(result.current.profile).toMatchObject({
      id: 'r1',
      firstName: 'Juan',
      available: true,
      vehicle: { type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' },
    })
  })

  it('updateProfile sends the input and refetches the profile', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.profile).not.toBeNull())

    await act(async () => {
      await result.current.updateProfile({ phone: '999' })
    })

    expect(operationVariables(testClient.lastRequest('UpdateRiderProfile'))).toEqual({
      input: { phone: '999' },
    })
    expect(testClient.requestsByName('RiderProfile').length).toBeGreaterThan(1)
  })

  it('updateVehicle sends the vehicle payload', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.profile).not.toBeNull())

    await act(async () => {
      await result.current.updateVehicle({ type: 'bici' })
    })

    expect(operationVariables(testClient.lastRequest('UpdateRiderVehicle'))).toEqual({
      input: { type: 'bici' },
    })
  })

  it('setAvailability toggles the online flag', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.profile).not.toBeNull())

    await act(async () => {
      await result.current.setAvailability(false)
    })

    expect(operationVariables(testClient.lastRequest('SetRiderAvailability'))).toEqual({
      online: false,
    })
  })

  it('updateLocation sends lat/lng variables', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.profile).not.toBeNull())

    await act(async () => {
      await result.current.updateLocation(-34.6, -58.4)
    })

    expect(operationVariables(testClient.lastRequest('UpdateRiderLocation'))).toEqual({
      lat: -34.6,
      lng: -58.4,
    })
  })
})
