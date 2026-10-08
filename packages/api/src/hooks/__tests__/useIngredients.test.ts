import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { IngredientInput } from '@repo/domain'
import { useIngredients } from '../useIngredients'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawIngredient = { id: 'i1', name: 'Queso', unit: 'kg', active: true }

const ingredientInput: IngredientInput = { name: 'Tomate', unit: 'kg', active: true }

const setup = () => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminIngredients':
        return { data: { ingredients: [rawIngredient] } }
      case 'CreateIngredient':
        return { data: { createIngredient: { ...rawIngredient, id: 'i2' } } }
      case 'UpdateIngredient':
        return { data: { updateIngredient: rawIngredient } }
      case 'SetIngredientActive':
        return { data: { setIngredientActive: rawIngredient } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useIngredients(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useIngredients', () => {
  it('loads and maps the ingredients', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.ingredients).toEqual([rawIngredient])
  })

  it('create sends the input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create(ingredientInput)
    })

    expect(operationVariables(testClient.lastRequest('CreateIngredient'))).toEqual({
      input: ingredientInput,
    })
    expect(testClient.requestsByName('AdminIngredients').length).toBeGreaterThan(1)
  })

  it('update sends id + input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update('i1', ingredientInput)
    })

    expect(operationVariables(testClient.lastRequest('UpdateIngredient'))).toEqual({
      id: 'i1',
      input: ingredientInput,
    })
    expect(testClient.requestsByName('AdminIngredients').length).toBeGreaterThan(1)
  })

  it('toggle sends id + active and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggle('i1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetIngredientActive'))).toEqual({
      id: 'i1',
      active: false,
    })
    expect(testClient.requestsByName('AdminIngredients').length).toBeGreaterThan(1)
  })
})
