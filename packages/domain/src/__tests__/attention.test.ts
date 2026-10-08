import { describe, expect, it } from 'vitest'
import { groupAttentionOrders } from '../attention'
import type { Order, OrderStatus } from '../order'

const makeOrder = (id: string, status: OrderStatus): Order =>
  ({
    id,
    number: id,
    clientId: 'c1',
    branchId: 'b1',
    deliveryAddress: { text: 'x', latitude: 0, longitude: 0 },
    status,
    total: 0,
    estimatedDeliveryAt: null,
    createdAt: '2025-01-01T10:00:00Z',
    items: [],
    statusHistory: [],
    availableTransitions: [],
  }) as Order

describe('groupAttentionOrders', () => {
  it('returns an empty array when there are no orders', () => {
    expect(groupAttentionOrders([])).toEqual([])
  })

  it('groups orders by status following the attention order', () => {
    const groups = groupAttentionOrders([
      makeOrder('a', 'PREPARING'),
      makeOrder('b', 'PENDING'),
      makeOrder('c', 'PENDING'),
      makeOrder('d', 'READY_FOR_DELIVERY'),
      makeOrder('e', 'CONFIRMED'),
    ])

    expect(groups.map((group) => group.status)).toEqual([
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_DELIVERY',
    ])
    expect(groups.map((group) => group.orders.map((order) => order.id))).toEqual([
      ['b', 'c'],
      ['e'],
      ['a'],
      ['d'],
    ])
  })

  it('drops groups without orders', () => {
    const groups = groupAttentionOrders([makeOrder('a', 'CONFIRMED')])

    expect(groups).toHaveLength(1)
    expect(groups[0].status).toBe('CONFIRMED')
  })

  it('excludes delivered, cancelled and on-the-way orders', () => {
    const groups = groupAttentionOrders([
      makeOrder('a', 'DELIVERED'),
      makeOrder('b', 'CANCELLED'),
      makeOrder('c', 'ON_THE_WAY'),
    ])

    expect(groups).toEqual([])
  })
})
