export const routes = {
  home: '/',
  products: '/products',
  stock: '/stock',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  reports: '/reports/products',
  profile: '/profile',
} as const

export const orderDetailPath = (id: string) => `/orders/${id}`
