import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProductEditor } from '../useProductEditor'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [],
  recipe: [],
}

const setup = (productId: string | undefined) => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminProduct':
        return { data: { product: rawProduct } }
      case 'CreateProduct':
        return { data: { createProduct: { id: 'new-1' } } }
      case 'UpdateProduct':
        return { data: { updateProduct: rawProduct } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useProductEditor(productId), {
    client: testClient.client,
  })
  return { testClient, ...rendered }
}

const productInput = {
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  available: true,
}

describe('useProductEditor', () => {
  it('loads an existing product', async () => {
    const { result } = setup('p1')
    await waitFor(() => expect(result.current.product).not.toBeNull())
    expect(result.current.product?.name).toBe('Burger')
  })

  it('does not query when there is no product id (create mode)', async () => {
    const { testClient } = setup(undefined)
    await act(async () => {
      await Promise.resolve()
    })
    expect(testClient.requestsByName('AdminProduct')).toHaveLength(0)
  })

  it('create returns the new product id without refetching', async () => {
    const { testClient, result } = setup(undefined)

    let createdId: string | null = null
    await act(async () => {
      createdId = await result.current.save(productInput)
    })

    expect(createdId).toBe('new-1')
    expect(operationVariables(testClient.lastRequest('CreateProduct'))).toEqual({
      input: productInput,
    })
    expect(testClient.requestsByName('AdminProduct')).toHaveLength(0)
  })

  it('update sends the id + input and refetches the product', async () => {
    const { testClient, result } = setup('p1')
    await waitFor(() => expect(result.current.product).not.toBeNull())

    let returnedId: string | null = null
    await act(async () => {
      returnedId = await result.current.save(productInput)
    })

    expect(returnedId).toBe('p1')
    expect(operationVariables(testClient.lastRequest('UpdateProduct'))).toEqual({
      id: 'p1',
      input: productInput,
    })
    expect(testClient.requestsByName('AdminProduct').length).toBeGreaterThan(1)
  })

  it('maps group input to the API enum and numbers', async () => {
    const { testClient, result } = setup('p1')
    await waitFor(() => expect(result.current.product).not.toBeNull())

    await act(async () => {
      await result.current.addGroup({
        name: 'Extras',
        type: 'multiple',
        required: true,
        min: 1,
        max: 3,
      })
    })

    expect(operationVariables(testClient.lastRequest('CreateConfigGroup'))).toEqual({
      productId: 'p1',
      input: { name: 'Extras', type: 'MULTIPLE', required: true, min: 1, max: 3 },
    })
  })

  it('defaults missing min/max to null in group input', async () => {
    const { testClient, result } = setup('p1')
    await waitFor(() => expect(result.current.product).not.toBeNull())

    await act(async () => {
      await result.current.addGroup({ name: 'Salsas', type: 'single', required: false })
    })

    expect(operationVariables(testClient.lastRequest('CreateConfigGroup'))?.input).toEqual({
      name: 'Salsas',
      type: 'SINGLE',
      required: false,
      min: null,
      max: null,
    })
  })

  it('does not mutate groups without a product id', async () => {
    const { testClient, result } = setup(undefined)
    await act(async () => {
      await result.current.addGroup({ name: 'X', type: 'single', required: false })
      await result.current.removeGroup('g1')
      await result.current.addOption('g1', { name: 'Q', extraPrice: 10, available: true })
      await result.current.addRecipeItem({ ingredientId: 'i1', quantity: 1 })
    })

    expect(testClient.requests).toHaveLength(0)
  })

  it.each([
    [
      'updateGroup',
      (r: ReturnType<typeof useProductEditor>) =>
        r.updateGroup('g1', { name: 'G', type: 'single', required: false }),
      'UpdateConfigGroup',
      {
        productId: 'p1',
        groupId: 'g1',
        input: { name: 'G', type: 'SINGLE', required: false, min: null, max: null },
      },
    ],
    [
      'removeGroup',
      (r: ReturnType<typeof useProductEditor>) => r.removeGroup('g1'),
      'DeleteConfigGroup',
      { productId: 'p1', groupId: 'g1' },
    ],
    [
      'addOption',
      (r: ReturnType<typeof useProductEditor>) =>
        r.addOption('g1', { name: 'Queso', extraPrice: 100, available: true }),
      'CreateConfigOption',
      {
        productId: 'p1',
        groupId: 'g1',
        input: { name: 'Queso', extraPrice: 100, available: true },
      },
    ],
    [
      'updateOption',
      (r: ReturnType<typeof useProductEditor>) =>
        r.updateOption('g1', 'o1', { name: 'Queso', extraPrice: 100, available: true }),
      'UpdateConfigOption',
      {
        productId: 'p1',
        groupId: 'g1',
        optionId: 'o1',
        input: { name: 'Queso', extraPrice: 100, available: true },
      },
    ],
    [
      'removeOption',
      (r: ReturnType<typeof useProductEditor>) => r.removeOption('g1', 'o1'),
      'DeleteConfigOption',
      { productId: 'p1', groupId: 'g1', optionId: 'o1' },
    ],
    [
      'addRecipeItem',
      (r: ReturnType<typeof useProductEditor>) =>
        r.addRecipeItem({ ingredientId: 'i1', quantity: 2 }),
      'AddRecipeItem',
      { productId: 'p1', input: { ingredientId: 'i1', quantity: 2 } },
    ],
    [
      'updateRecipeItem',
      (r: ReturnType<typeof useProductEditor>) =>
        r.updateRecipeItem('r1', { ingredientId: 'i1', quantity: 2 }),
      'UpdateRecipeItem',
      { productId: 'p1', itemId: 'r1', input: { ingredientId: 'i1', quantity: 2 } },
    ],
    [
      'removeRecipeItem',
      (r: ReturnType<typeof useProductEditor>) => r.removeRecipeItem('r1'),
      'RemoveRecipeItem',
      { productId: 'p1', itemId: 'r1' },
    ],
  ])('%s sends the expected payload', async (_name, action, operationName, expected) => {
    const { testClient, result } = setup('p1')
    await waitFor(() => expect(result.current.product).not.toBeNull())

    await act(async () => {
      await action(result.current)
    })

    expect(operationVariables(testClient.lastRequest(operationName as string))).toEqual(expected)
  })
})
