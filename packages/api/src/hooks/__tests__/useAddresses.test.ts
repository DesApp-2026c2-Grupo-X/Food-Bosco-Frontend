import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAddresses } from '../useAddresses'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawAddress = {
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
  active: true,
}

const addressInput = {
  label: 'Casa',
  text: 'Calle 1',
  city: 'CABA',
  postalCode: '1425',
  latitude: -34.6,
  longitude: -58.4,
}

const setup = () => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'MyAddresses':
        return { data: { myAddresses: [rawAddress] } }
      case 'CreateAddress':
        return { data: { createAddress: { ...rawAddress, id: 'a2' } } }
      case 'UpdateAddress':
        return { data: { updateAddress: rawAddress } }
      case 'DeleteAddress':
        return { data: { deleteAddress: true } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useAddresses(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useAddresses (via createCrudResource)', () => {
  it('maps the address list', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.addresses).toEqual([
      {
        id: 'a1',
        label: 'Casa',
        text: 'Calle 1',
        city: 'CABA',
        postalCode: '1425',
        latitude: -34.6,
        longitude: -58.4,
        active: true,
      },
    ])
  })

  it('create sends the input, returns the mapped address and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let created: { id: string } | null = null
    await act(async () => {
      created = await result.current.create(addressInput)
    })

    expect(operationVariables(testClient.lastRequest('CreateAddress'))).toEqual({
      input: addressInput,
    })
    expect(created).toMatchObject({ id: 'a2' })
    expect(testClient.requestsByName('MyAddresses').length).toBeGreaterThan(1)
  })

  it('update sends id + input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update('a1', addressInput)
    })

    expect(operationVariables(testClient.lastRequest('UpdateAddress'))).toEqual({
      id: 'a1',
      input: addressInput,
    })
    expect(testClient.requestsByName('MyAddresses').length).toBeGreaterThan(1)
  })

  it('remove sends the id and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.remove('a1')
    })

    expect(operationVariables(testClient.lastRequest('DeleteAddress'))).toEqual({ id: 'a1' })
    expect(testClient.requestsByName('MyAddresses').length).toBeGreaterThan(1)
  })
})
