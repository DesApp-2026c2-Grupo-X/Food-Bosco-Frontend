import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGlobalStock } from '../useGlobalStock'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawStock = { ingredientId: 'i1', branchId: 'b1', quantity: 10 }

describe('useGlobalStock', () => {
  it('F-8: consulta todas las sucursales y ajusta con el branchId indicado', async () => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminBranchStock') {
        return { data: { branchStock: [rawStock] } }
      }
      return { data: { adjustStock: rawStock } }
    })
    const { result } = renderHookWithProviders(() => useGlobalStock(), {
      client: testClient.client,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(operationVariables(testClient.lastRequest('AdminBranchStock'))).not.toHaveProperty(
      'branchId',
    )

    await act(async () => {
      await result.current.adjust('b9', 'i1', -2, 'merma')
    })

    expect(operationVariables(testClient.lastRequest('AdjustStock'))).toEqual({
      input: { branchId: 'b9', ingredientId: 'i1', delta: -2, reason: 'merma' },
    })
  })
})
