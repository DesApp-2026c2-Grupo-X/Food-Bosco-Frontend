import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useBranchStatus } from '../useBranchStatus'
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
  hours: [],
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

const setup = (active = true) => {
  const branch = { ...rawBranch, active }
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'Branch') {
      return { data: { branch } }
    }
    if (operation.operationName === 'SetBranchActive') {
      return { data: { setBranchActive: branch } }
    }
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useBranchStatus(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranchStatus', () => {
  afterEach(() => useAuthStore.setState({ user: null }))

  it('exposes the open state from the backend branch', async () => {
    setUser('b1')
    const { result } = setup(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isOpen).toBe(true)
  })

  it('reports closed when the backend has active=false', async () => {
    setUser('b1')
    const { result } = setup(false)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isOpen).toBe(false)
  })

  it('toggles by mutating the branch active flag and refetching', async () => {
    setUser('b1')
    const { testClient, result } = setup(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggle()
    })

    expect(operationVariables(testClient.lastRequest('SetBranchActive'))).toEqual({
      id: 'b1',
      active: false,
    })
    expect(testClient.requestsByName('Branch').length).toBeGreaterThan(1)
  })

  it('defaults to open and does not mutate when there is no branch', async () => {
    setUser(undefined)
    const { testClient, result } = setup()
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isOpen).toBe(true)
    await act(async () => {
      await result.current.toggle()
    })
    expect(testClient.requestsByName('SetBranchActive')).toHaveLength(0)
  })
})
