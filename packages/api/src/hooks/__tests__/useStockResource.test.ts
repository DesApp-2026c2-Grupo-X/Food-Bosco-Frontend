import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStockResource } from '../useStockResource'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawStock = (overrides: Record<string, unknown> = {}) => ({
  ingredientId: 'i1',
  branchId: 'b1',
  quantity: 10,
  ingredient: { id: 'i1', name: 'Queso', unit: 'kg', active: true },
  ...overrides,
})

const setup = (branchId?: string, skip = false) => {
  const testClient = createTestClient((operation) => {
    if (operation.operationName === 'AdminBranchStock') {
      return { data: { branchStock: [rawStock()] } }
    }
    return { data: { adjustStock: rawStock({ quantity: 5 }) } }
  })
  const rendered = renderHookWithProviders(() => useStockResource(branchId, skip), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useStockResource', () => {
  it('F-1: mapea el stock a dominio, incluido el ingrediente', async () => {
    const { result } = setup('b1')
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.stock).toEqual([
      {
        ingredientId: 'i1',
        branchId: 'b1',
        quantity: 10,
        ingredient: { id: 'i1', name: 'Queso', unit: 'kg', active: true },
      },
    ])
  })

  it('F-1b: deja ingredient en null cuando el backend no lo trae', async () => {
    const testClient = createTestClient(() => ({
      data: { branchStock: [{ ...rawStock(), ingredient: null }] },
    }))
    const { result } = renderHookWithProviders(() => useStockResource('b1'), {
      client: testClient.client,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.stock[0]?.ingredient).toBeNull()
  })

  it('F-2: con branchId envía las variables; sin branchId no las envía', async () => {
    const withBranch = setup('b1')
    await waitFor(() => expect(withBranch.result.current.isLoading).toBe(false))
    expect(operationVariables(withBranch.testClient.lastRequest('AdminBranchStock'))).toEqual({
      branchId: 'b1',
    })

    const withoutBranch = setup()
    await waitFor(() => expect(withoutBranch.result.current.isLoading).toBe(false))
    expect(
      operationVariables(withoutBranch.testClient.lastRequest('AdminBranchStock')),
    ).not.toHaveProperty('branchId')
  })

  it('F-3: skip evita la query', async () => {
    const { testClient, result } = setup('b1', true)
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.stock).toEqual([])
    expect(testClient.requestsByName('AdminBranchStock')).toHaveLength(0)
  })

  it('F-4: adjust envía la mutación y refresca la query', async () => {
    const { testClient, result } = setup('b1')
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.adjust('b1', 'i1', 7, 'conteo')
    })

    expect(operationVariables(testClient.lastRequest('AdjustStock'))).toEqual({
      input: { branchId: 'b1', ingredientId: 'i1', delta: 7, reason: 'conteo' },
    })
    expect(testClient.requestsByName('AdminBranchStock')).toHaveLength(2)
  })

  it('F-5: devuelve lista vacía por defecto', async () => {
    const testClient = createTestClient(() => ({ data: { branchStock: [] } }))
    const { result } = renderHookWithProviders(() => useStockResource(), {
      client: testClient.client,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.stock).toEqual([])
  })
})
