import { describe, expect, it } from 'vitest'
import { routes, tripOrderDetailPath } from '../routes'

describe('tripOrderDetailPath', () => {
  it('builds the trip detail path for an order id', () => {
    expect(tripOrderDetailPath('o1')).toBe('/trip/o1')
    expect(tripOrderDetailPath('order-42')).toBe('/trip/order-42')
  })

  it('matches the trip detail route template', () => {
    expect(routes.tripOrderDetail).toBe('/trip/:orderId')
  })
})
