import { describe, expect, it } from 'vitest'
import {
  toBranch,
  toCart,
  toCartItem,
  toCategory,
  toConfigGroup,
  toConfigOption,
  toOrder,
  toOrderItem,
  toProduct,
} from '../store'

describe('toCategory', () => {
  it('coerces fields', () => {
    expect(toCategory({ id: 1, name: 'Bebidas', active: 1 })).toEqual({
      id: '1',
      name: 'Bebidas',
      active: true,
    })
  })
})

describe('toConfigOption', () => {
  it('coerces extraPrice and availability', () => {
    expect(toConfigOption({ id: 'o1', name: 'Queso', extraPrice: '150', available: 0 })).toEqual({
      id: 'o1',
      name: 'Queso',
      extraPrice: 150,
      available: false,
    })
  })
})

describe('toConfigGroup', () => {
  it('maps MULTIPLE to multiple and anything else to single', () => {
    expect(toConfigGroup({ type: 'MULTIPLE' }).type).toBe('multiple')
    expect(toConfigGroup({ type: 'SINGLE' }).type).toBe('single')
    expect(toConfigGroup({ type: 'weird' }).type).toBe('single')
  })

  it('keeps null min/max and maps options', () => {
    const group = toConfigGroup({
      id: 'g1',
      name: 'Extras',
      min: null,
      max: '3',
      options: [{ id: 'o1', name: 'Queso', extraPrice: 100, available: true }],
    })
    expect(group.min).toBeNull()
    expect(group.max).toBe(3)
    expect(group.options).toHaveLength(1)
  })
})

describe('toProduct', () => {
  it('maps a full product and defaults collections to empty arrays', () => {
    const product = toProduct({
      id: 'p1',
      categoryId: 'c1',
      name: 'Burger',
      description: 'Rica',
      price: '1200',
      image: null,
      available: true,
    })
    expect(product).toMatchObject({
      id: 'p1',
      categoryId: 'c1',
      name: 'Burger',
      price: 1200,
      image: null,
      available: true,
      configGroups: [],
      recipe: [],
    })
  })

  it('stringifies a present image', () => {
    expect(toProduct({ image: 'https://img' }).image).toBe('https://img')
  })
})

describe('toBranch', () => {
  it('maps coordinates and hours', () => {
    const branch = toBranch({
      id: 'b1',
      name: 'Centro',
      addressText: 'Calle 1',
      latitude: '-34.6',
      longitude: '-58.4',
      phone: null,
      active: true,
      hours: [{ dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false }],
    })
    expect(branch.latitude).toBe(-34.6)
    expect(branch.phone).toBeNull()
    expect(branch.hours[0]).toEqual({
      dayOfWeek: 1,
      opening: '09:00',
      closing: '18:00',
      closed: false,
    })
  })
})

describe('toOrderItem', () => {
  it('maps options and subtotal', () => {
    const item = toOrderItem({
      productId: 'p1',
      name: 'Burger',
      unitPrice: '1000',
      quantity: '2',
      observations: 'sin sal',
      subtotal: '2000',
      options: [{ optionId: 'o1', name: 'Queso', extraPrice: '100' }],
    })
    expect(item).toEqual({
      productId: 'p1',
      name: 'Burger',
      unitPrice: 1000,
      quantity: 2,
      observations: 'sin sal',
      subtotal: 2000,
      options: [{ optionId: 'o1', name: 'Queso', extraPrice: 100 }],
    })
  })
})

describe('toOrder', () => {
  const raw = {
    id: 'o1',
    number: '101',
    clientId: 'c1',
    riderId: null,
    branchId: 'b1',
    deliveryAddress: { text: 'Calle 1', latitude: '-34.6', longitude: '-58.4' },
    status: 'PENDING',
    total: '2500',
    estimatedDeliveryAt: null,
    createdAt: '2025-01-01T10:00:00Z',
    items: [],
    statusHistory: [
      { previousStatus: 'PENDING', newStatus: 'CONFIRMED', changedAt: '2025-01-01T10:05:00Z' },
    ],
    availableTransitions: ['CONFIRMED', 'CANCELLED'],
  }

  it('maps scalars, address and transitions', () => {
    const order = toOrder(raw)
    expect(order).toMatchObject({
      id: 'o1',
      number: '101',
      riderId: null,
      status: 'PENDING',
      total: 2500,
      estimatedDeliveryAt: null,
      branch: null,
      client: null,
      availableTransitions: ['CONFIRMED', 'CANCELLED'],
    })
    expect(order.deliveryAddress).toEqual({ text: 'Calle 1', latitude: -34.6, longitude: -58.4 })
    expect(order.statusHistory).toHaveLength(1)
  })

  it('maps an embedded rider location when present', () => {
    const order = toOrder({
      ...raw,
      riderLocation: { latitude: '-34.7', longitude: '-58.3' },
    })
    expect(order.riderLocation).toEqual({ latitude: -34.7, longitude: -58.3 })
  })

  it('defaults rider location to null', () => {
    expect(toOrder(raw).riderLocation).toBeNull()
  })
})

describe('toCart', () => {
  it('maps items, options and total', () => {
    const cart = toCart({
      id: 'cart1',
      clientId: 'c1',
      status: 'OPEN',
      total: '3000',
      items: [
        {
          id: 'i1',
          productId: 'p1',
          product: { id: 'p1', name: 'Burger', price: '1000' },
          quantity: '2',
          observations: null,
          optionIds: ['o1'],
          options: [{ id: 'o1', name: 'Queso', extraPrice: '100', available: true }],
        },
      ],
    })
    expect(cart.total).toBe(3000)
    expect(cart.items[0]).toMatchObject({
      id: 'i1',
      productId: 'p1',
      quantity: 2,
      optionIds: ['o1'],
    })
    expect(cart.items[0]?.product?.name).toBe('Burger')
  })
})

describe('toCartItem', () => {
  it('leaves product null when absent', () => {
    const item = toCartItem({ id: 'i1', productId: 'p1', quantity: 1 })
    expect(item.product).toBeNull()
    expect(item.options).toEqual([])
    expect(item.optionIds).toEqual([])
  })
})
