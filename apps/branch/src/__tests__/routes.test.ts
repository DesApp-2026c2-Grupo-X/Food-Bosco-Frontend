import { describe, expect, it } from 'vitest'
import { orderDetailPath, routes } from '../routes'

describe('branch routes', () => {
  it('exposes the route patterns', () => {
    expect(routes).toMatchObject({
      home: '/',
      products: '/products',
      stock: '/stock',
      orders: '/orders',
      orderDetail: '/orders/:orderId',
      reports: '/reports/products',
      profile: '/profile',
    })
  })

  it('builds the order detail path from an id', () => {
    expect(orderDetailPath('o1')).toBe('/orders/o1')
    expect(orderDetailPath('42')).toBe('/orders/42')
  })
})
