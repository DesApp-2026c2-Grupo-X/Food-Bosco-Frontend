import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { useBranchStock } from '../useBranchStock'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawStock = { ingredientId: 'i1', branchId: 'b1', quantity: 10 }

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
    if (operation.operationName === 'AdminBranchStock') {
      return { data: { branchStock: [rawStock] } }
    }
    return { data: { adjustStock: rawStock } }
  })
  const rendered = renderHookWithProviders(() => useBranchStock(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranchStock', () => {
  afterEach(() => useAuthStore.setState({ user: null }))

  it('F-6: consulta y ajusta la sucursal del usuario', async () => {
    setUser('b1')
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminBranchStock'))).toEqual({
      branchId: 'b1',
    })

    await act(async () => {
      await result.current.adjust('i1', 5, 'reposicion')
    })

    expect(operationVariables(testClient.lastRequest('AdjustStock'))).toEqual({
      input: { branchId: 'b1', ingredientId: 'i1', delta: 5, reason: 'reposicion' },
    })
  })

  it('F-7: sin sucursal no consulta y el ajuste es no-op', async () => {
    setUser(undefined)
    const { testClient, result } = setup()
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.stock).toEqual([])

    await act(async () => {
      await result.current.adjust('i1', 5, 'x')
    })

    expect(testClient.requestsByName('AdminBranchStock')).toHaveLength(0)
    expect(testClient.requestsByName('AdjustStock')).toHaveLength(0)
  })
})
