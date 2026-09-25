import { describe, expect, it } from 'vitest'
import { cartItemCount, cartLineTotal, cartLineUnitPrice, cartTotal, type CartItem } from '../cart'

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'item-1',
  productId: 'p1',
  product: {
    id: 'p1',
    categoryId: 'c1',
    name: 'Burger',
    description: '',
    price: 1000,
    image: null,
    available: true,
    configGroups: [],
    recipe: [],
  },
  quantity: 1,
  observations: null,
  optionIds: [],
  options: [],
  ...overrides,
})

describe('cartLineUnitPrice', () => {
  it('adds option extras to the product base price', () => {
    const item = makeItem({
      options: [
        { id: 'o1', name: 'Queso', extraPrice: 150, available: true },
        { id: 'o2', name: 'Bacon', extraPrice: 250, available: true },
      ],
    })
    expect(cartLineUnitPrice(item)).toBe(1400)
  })

  it('ignores options when the product is missing', () => {
    const item = makeItem({
      product: null,
      options: [{ id: 'o1', name: 'Queso', extraPrice: 150, available: true }],
    })
    expect(cartLineUnitPrice(item)).toBe(150)
  })
})

describe('cartLineTotal', () => {
  it('multiplies unit price by quantity', () => {
    const item = makeItem({
      quantity: 3,
      options: [{ id: 'o1', name: 'Queso', extraPrice: 150, available: true }],
    })
    expect(cartLineTotal(item)).toBe(3450)
  })
})

describe('cartItemCount', () => {
  it('sums quantities, not lines', () => {
    expect(cartItemCount([makeItem({ quantity: 2 }), makeItem({ id: 'i2', quantity: 5 })])).toBe(7)
  })

  it('is zero for an empty cart', () => {
    expect(cartItemCount([])).toBe(0)
  })
})

describe('cartTotal', () => {
  it('sums every line total including extras', () => {
    const items = [
      makeItem({
        quantity: 2,
        options: [{ id: 'o1', name: 'Queso', extraPrice: 100, available: true }],
      }),
      makeItem({ id: 'i2', product: null, quantity: 3 }),
    ]
    items[1].product = {
      id: 'p2',
      categoryId: 'c1',
      name: 'Papas',
      description: '',
      price: 500,
      image: null,
      available: true,
      configGroups: [],
      recipe: [],
    }
    expect(cartTotal(items)).toBe(2200 + 1500)
  })
})
