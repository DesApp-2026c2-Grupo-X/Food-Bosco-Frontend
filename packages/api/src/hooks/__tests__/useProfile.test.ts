import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useProfile } from '../useProfile'
import { createTestClient } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawMe = {
  id: 'u1',
  email: 'a@b.com',
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '123',
  role: 'CUSTOMER',
  active: true,
  branchId: 'b1',
  vehicle: null,
}

const originalUpdateProfile = useAuthStore.getState().updateProfile

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'Me') {
      return { data: { me: rawMe } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useProfile(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useProfile', () => {
  afterEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, updateProfile: originalUpdateProfile })
  })

  it('skips ME when there is no access token', async () => {
    useAuthStore.setState({ user: null, accessToken: null })
    const { testClient, result } = setup()
    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('Me')).toHaveLength(0)
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('loads ME and stores the mapped user', async () => {
    useAuthStore.setState({ user: null, accessToken: 'tok' })
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.user).not.toBeNull())

    expect(result.current.user).toMatchObject({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'Ana',
      role: 'customer',
      active: true,
      branchId: 'b1',
    })
    expect(result.current.isLoading).toBe(false)
    expect(testClient.requestsByName('Me')).toHaveLength(1)
  })

  it('queries ME with a network-only fetch policy', async () => {
    useAuthStore.setState({ user: null, accessToken: 'tok' })
    const testClient = createTestClient(() => ({ data: { me: rawMe } }))
    const spy = vi.spyOn(testClient.client, 'watchQuery')
    renderHookWithProviders(() => useProfile(), { client: testClient.client })

    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'network-only' }))
  })

  it('delegates updateProfile to the auth store', async () => {
    const updateProfile = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ user: null, accessToken: 'tok', updateProfile })
    const { result } = setup()
    const input = { firstName: 'Nueva', lastName: 'Persona', phone: '555' }

    await act(async () => {
      await result.current.updateProfile(input)
    })

    expect(updateProfile).toHaveBeenCalledWith(input)
  })
})
