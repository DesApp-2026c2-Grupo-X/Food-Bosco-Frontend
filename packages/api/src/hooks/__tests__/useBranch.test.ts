import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useBranch } from '../useBranch'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawBranch = {
  id: 'b1',
  name: 'Sucursal Centro',
  addressText: 'Calle 1',
  latitude: -34.6,
  longitude: -58.4,
  phone: '123',
  active: true,
  hours: [{ dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false }],
}

const setUser = (branchId?: string) =>
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'admin@b.com',
      role: 'branch_admin',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '1',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      branchId,
    },
  })

const setup = () => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'Branch') {
      return { data: { branch: rawBranch } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useBranch(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranch', () => {
  afterEach(() => useAuthStore.setState({ user: null }))

  it('loads the branch of the authenticated user and maps it', async () => {
    setUser('b1')
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('Branch'))).toEqual({ id: 'b1' })
    expect(result.current.branch).toMatchObject({
      id: 'b1',
      name: 'Sucursal Centro',
      addressText: 'Calle 1',
      active: true,
    })
    expect(result.current.branch?.hours[0]?.opening).toBe('09:00')
  })

  it('queries the branch with a network-only fetch policy', async () => {
    setUser('b1')
    const testClient = createTestClient(() => ({ data: { branch: rawBranch } }))
    const spy = vi.spyOn(testClient.client, 'watchQuery')
    renderHookWithProviders(() => useBranch(), { client: testClient.client })

    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'network-only' }))
  })

  it('skips the query when there is no branch', async () => {
    setUser(undefined)
    const { testClient, result } = setup()
    await act(async () => {
      await Promise.resolve()
    })

    expect(testClient.requestsByName('Branch')).toHaveLength(0)
    expect(result.current.branch).toBeNull()
  })
})
