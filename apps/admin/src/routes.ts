export const routes = {
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
} as const

export const categoryEditPath = (id: number | string) => `/categories/${id}/edit`
export const productEditPath = (id: number | string) => `/products/${id}/edit`
export const branchEditPath = (id: number | string) => `/branches/${id}/edit`
export const staffEditPath = (id: number | string) => `/staff/${id}/edit`
export const orderDetailPath = (id: number | string) => `/orders/${id}`
