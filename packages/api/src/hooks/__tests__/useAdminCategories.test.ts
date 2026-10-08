import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CategoryInput } from '@repo/domain'
import { useAdminCategories } from '../useAdminCategories'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawCategory = { id: 'c1', name: 'Comida', active: true }

const categoryInput: CategoryInput = { name: 'Bebidas', active: true }

const setup = () => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminCategories':
        return { data: { categories: [rawCategory] } }
      case 'CreateCategory':
        return { data: { createCategory: { ...rawCategory, id: 'c2' } } }
      case 'UpdateCategory':
        return { data: { updateCategory: rawCategory } }
      case 'SetCategoryActive':
        return { data: { setCategoryActive: rawCategory } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useAdminCategories(), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

describe('useAdminCategories', () => {
  it('loads and maps the categories', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.categories).toEqual([rawCategory])
  })

  it('create sends the input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create(categoryInput)
    })

    expect(operationVariables(testClient.lastRequest('CreateCategory'))).toEqual({
      input: categoryInput,
    })
    expect(testClient.requestsByName('AdminCategories').length).toBeGreaterThan(1)
  })

  it('update sends id + input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update('c1', categoryInput)
    })

    expect(operationVariables(testClient.lastRequest('UpdateCategory'))).toEqual({
      id: 'c1',
      input: categoryInput,
    })
    expect(testClient.requestsByName('AdminCategories').length).toBeGreaterThan(1)
  })

  it('toggle sends id + active', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggle('c1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetCategoryActive'))).toEqual({
      id: 'c1',
      active: false,
    })
  })

  it('remove maps to SetCategoryActive with active false', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.remove('c1')
    })

    expect(operationVariables(testClient.lastRequest('SetCategoryActive'))).toEqual({
      id: 'c1',
      active: false,
    })
    expect(testClient.requestsByName('AdminCategories').length).toBeGreaterThan(1)
  })

  it('exposes isMutating while a mutation is pending', async () => {
    let resolveMutation: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveMutation = resolve
    })
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'AdminCategories') {
        return { data: { categories: [rawCategory] } }
      }
      if (operation.operationName === 'SetCategoryActive') {
        return pending.then(() => ({ data: { setCategoryActive: rawCategory } }))
      }
      return { data: {} }
    })
    const { result } = renderHookWithProviders(() => useAdminCategories(), {
      client: testClient.client,
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isMutating).toBe(false)

    let mutation: Promise<void> = Promise.resolve()
    act(() => {
      mutation = result.current.toggle('c1', false)
    })
    await waitFor(() => expect(result.current.isMutating).toBe(true))

    await act(async () => {
      resolveMutation(undefined)
      await mutation
    })
    expect(result.current.isMutating).toBe(false)
  })
})
