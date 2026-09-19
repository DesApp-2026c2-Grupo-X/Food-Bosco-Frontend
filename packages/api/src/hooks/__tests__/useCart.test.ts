import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CartItem } from '@repo/domain'
import { findMatchingCartItem, useCart } from '../useCart'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawOption = { id: 'opt-cheese', name: 'Queso', extraPrice: 150, available: true }

const rawCartItem = {
  id: 'item-1',
  productId: 'p1',
  product: { id: 'p1', name: 'Burger', price: 1000 },
  quantity: 2,
  observations: 'sin sal',
  optionIds: ['opt-cheese'],
  options: [rawOption],
}

const rawCart = (items: unknown[] = [rawCartItem]) => ({
  id: 'cart-1',
  clientId: 'c1',
  status: 'OPEN',
  total: 2300,
  items,
})

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'item-1',
  productId: 'p1',
  product: null,
  quantity: 1,
  observations: null,
  optionIds: [],
  options: [],
  ...overrides,
})

describe('findMatchingCartItem', () => {
  it('matches by product, options (order-insensitive) and observations', () => {
    const items = [makeItem({ optionIds: ['a', 'b'], observations: 'sin sal' })]
    expect(
      findMatchingCartItem(items, {
        productId: 'p1',
        quantity: 1,
        optionIds: ['b', 'a'],
        observations: ' sin sal ',
      }),
    ).toBe(items[0])
  })

  it('treats null and empty observations as equal', () => {
    const items = [makeItem({ observations: null })]
    expect(findMatchingCartItem(items, { productId: 'p1', quantity: 1 })).toBe(items[0])
    expect(findMatchingCartItem(items, { productId: 'p1', quantity: 1, observations: '' })).toBe(
      items[0],
    )
  })

  it('does not match different products or options', () => {
    const items = [makeItem({ optionIds: ['a'] })]
    expect(
      findMatchingCartItem(items, { productId: 'p2', quantity: 1, optionIds: ['a'] }),
    ).toBeUndefined()
    expect(
      findMatchingCartItem(items, { productId: 'p1', quantity: 1, optionIds: ['b'] }),
    ).toBeUndefined()
  })
})

describe('useCart', () => {
  const setup = (mutateError?: Error) => {
    const testClient = createTestClient((operation) => {
      if (operation.operationName === 'MyCart') {
        return { data: { myCart: rawCart() } }
      }
      if (mutateError) return mutateError
      return { data: {} }
    })
    return {
      testClient,
      ...renderHookWithProviders(() => useCart(), { client: testClient.client }),
    }
  }

  it('loads and maps the cart', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.cart).not.toBeNull())
    expect(result.current.cart?.items[0]?.product?.name).toBe('Burger')
    expect(result.current.cart?.items[0]?.quantity).toBe(2)
  })

  it('adds a new line when there is no matching item', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.cart).not.toBeNull())

    await act(async () => {
      await result.current.addItem({ productId: 'p2', quantity: 1, optionIds: ['opt-bacon'] })
    })

    const request = testClient.lastRequest('AddCartItem')
    expect(request).toBeDefined()
    expect(operationVariables(request)?.input).toEqual({
      productId: 'p2',
      quantity: 1,
      optionIds: ['opt-bacon'],
    })
  })

  it('merges quantity into an existing matching line instead of adding a new one', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.cart).not.toBeNull())

    await act(async () => {
      await result.current.addItem({
        productId: 'p1',
        quantity: 3,
        optionIds: ['opt-cheese'],
        observations: 'sin sal',
      })
    })

    expect(testClient.requestsByName('AddCartItem')).toHaveLength(0)
    const request = testClient.lastRequest('UpdateCartItem')
    expect(operationVariables(request)).toEqual({
      itemId: 'item-1',
      input: { quantity: 5 },
    })
  })

  it('refetches the cart after every mutation', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.cart).not.toBeNull())
    const before = testClient.requestsByName('MyCart').length

    await act(async () => {
      await result.current.removeItem('item-1')
    })

    expect(testClient.requestsByName('MyCart').length).toBeGreaterThan(before)
    expect(operationVariables(testClient.lastRequest('RemoveCartItem'))).toEqual({
      itemId: 'item-1',
    })
  })

  it('updates an item with the provided patch', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.cart).not.toBeNull())

    await act(async () => {
      await result.current.updateItem('item-1', { observations: 'con sal' })
    })

    expect(operationVariables(testClient.lastRequest('UpdateCartItem'))).toEqual({
      itemId: 'item-1',
      input: { observations: 'con sal' },
    })
  })

  it('propagates API errors to the caller', async () => {
    const { result } = setup(new Error('boom'))
    await waitFor(() => expect(result.current.cart).not.toBeNull())

    await expect(
      act(async () => {
        await result.current.addItem({ productId: 'p2', quantity: 1 })
      }),
    ).rejects.toThrow('boom')
  })
})
