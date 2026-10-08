import { describe, expect, it } from 'vitest'
import {
  branchEditPath,
  categoryEditPath,
  orderDetailPath,
  productEditPath,
  routes,
  staffEditPath,
} from '../routes'

describe('admin routes', () => {
  it('exposes the route patterns', () => {
    expect(routes).toMatchObject({
      home: '/',
      categories: '/categories',
      categoryNew: '/categories/new',
      categoryEdit: '/categories/:categoryId/edit',
      products: '/products',
      productNew: '/products/new',
      productEdit: '/products/:productId/edit',
      ingredients: '/ingredients',
      branches: '/branches',
      branchNew: '/branches/new',
      branchEdit: '/branches/:branchId/edit',
      staff: '/staff',
      staffNew: '/staff/new',
      staffEdit: '/staff/:userId/edit',
      parameters: '/parameters',
      orders: '/orders',
      orderDetail: '/orders/:orderId',
      stock: '/stock',
      reports: '/reports/products',
      profile: '/profile',
    })
  })

  it('builds edit paths from string ids', () => {
    expect(categoryEditPath('c1')).toBe('/categories/c1/edit')
    expect(productEditPath('p1')).toBe('/products/p1/edit')
    expect(branchEditPath('b1')).toBe('/branches/b1/edit')
    expect(staffEditPath('u1')).toBe('/staff/u1/edit')
    expect(orderDetailPath('o1')).toBe('/orders/o1')
  })

  it('builds edit paths from numeric ids', () => {
    expect(categoryEditPath(3)).toBe('/categories/3/edit')
    expect(productEditPath(4)).toBe('/products/4/edit')
    expect(branchEditPath(5)).toBe('/branches/5/edit')
    expect(staffEditPath(6)).toBe('/staff/6/edit')
    expect(orderDetailPath(7)).toBe('/orders/7')
  })
})
