import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useProductConfig } from '../useProductConfig'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const { notifyCart, notifyCartError } = vi.hoisted(() => ({
  notifyCart: vi.fn(),
  notifyCartError: vi.fn(),
}))

vi.mock('@repo/components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/components')>()),
  notifyCart,
  notifyCartError,
}))

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Burger',
  description: 'Rica',
  price: 1000,
  image: null,
  available: true,
  configGroups: [
    {
      id: 'g1',
      name: 'Tamaño',
      type: 'SINGLE',
      required: true,
      min: 1,
      max: 1,
      options: [{ id: 'o1', name: 'Grande', extraPrice: 200, available: true }],
    },
    {
      id: 'g2',
      name: 'Extras',
      type: 'MULTIPLE',
      required: false,
      min: 0,
      max: 3,
      options: [
        { id: 'o2', name: 'Queso', extraPrice: 150, available: true },
        { id: 'o3', name: 'Bacon', extraPrice: 250, available: true },
      ],
    },
  ],
  recipe: [],
}

const setup = (product: unknown = rawProduct, mutationError?: Error) => {
  const client = createTestClient((operation) => {
    if (operation.operationName === 'Product') return { data: { product } }
    if (operation.operationName === 'MyCart') {
      return {
        data: {
          myCart: { id: 'cart', clientId: 'c1', status: 'OPEN', total: 0, items: [] },
        },
      }
    }
    if (mutationError) return mutationError
    return { data: {} }
  })
  const rendered = renderHookWithProviders(() => useProductConfig('p1'), { client: client.client })
  return { client, ...rendered }
}

describe('useProductConfig', () => {
  it('loads the product', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())
    expect(result.current.product?.name).toBe('Burger')
  })

  it('requires a mandatory group before allowing add to cart', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())

    expect(result.current.missingRequired).toBe(true)
    expect(result.current.canAdd).toBe(false)

    act(() => result.current.selectOption('g1', 'o1', 'single'))
    expect(result.current.missingRequired).toBe(false)
    expect(result.current.canAdd).toBe(true)
  })

  it('adds single option extras to the unit price and total', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())

    act(() => result.current.selectOption('g1', 'o1', 'single'))
    expect(result.current.unitPrice).toBe(1200)

    act(() => result.current.setQuantity(3))
    expect(result.current.total).toBe(3600)
  })

  it('toggles multiple options on and off', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())

    act(() => result.current.selectOption('g2', 'o2', 'multiple'))
    act(() => result.current.selectOption('g2', 'o3', 'multiple'))
    expect(result.current.unitPrice).toBe(1400)

    act(() => result.current.selectOption('g2', 'o2', 'multiple'))
    expect(result.current.unitPrice).toBe(1250)
  })

  it('cannot add an unavailable product', async () => {
    const { result } = setup({ ...rawProduct, available: false })
    await waitFor(() => expect(result.current.product).not.toBeNull())

    act(() => result.current.selectOption('g1', 'o1', 'single'))
    expect(result.current.canAdd).toBe(false)
  })

  it('sends the configured item to the cart and notifies success', async () => {
    const { client, result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())

    act(() => {
      result.current.selectOption('g1', 'o1', 'single')
      result.current.selectOption('g2', 'o3', 'multiple')
      result.current.setQuantity(2)
      result.current.setNotes('  sin sal  ')
    })

    let added = false
    await act(async () => {
      added = await result.current.addToCart()
    })

    expect(added).toBe(true)
    expect(operationVariables(client.lastRequest('AddCartItem'))?.input).toEqual({
      productId: 'p1',
      quantity: 2,
      observations: 'sin sal',
      optionIds: ['o1', 'o3'],
    })
    expect(notifyCart).toHaveBeenCalledWith(expect.objectContaining({ title: 'Producto agregado' }))
  })

  it('does nothing when a required group is missing', async () => {
    const { client, result } = setup()
    await waitFor(() => expect(result.current.product).not.toBeNull())

    let added = true
    await act(async () => {
      added = await result.current.addToCart()
    })

    expect(added).toBe(false)
    expect(client.requestsByName('AddCartItem')).toHaveLength(0)
  })

  it('surfaces an error and notifies when the mutation fails', async () => {
    const { result } = setup(rawProduct, new Error('boom'))
    await waitFor(() => expect(result.current.product).not.toBeNull())

    act(() => result.current.selectOption('g1', 'o1', 'single'))

    let added = true
    await act(async () => {
      added = await result.current.addToCart()
    })

    expect(added).toBe(false)
    expect(result.current.error).toBe('No pudimos agregar el producto. Intentá de nuevo.')
    expect(notifyCartError).toHaveBeenCalled()
  })
})
