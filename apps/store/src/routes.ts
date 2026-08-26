export const routes = {
  home: '/',
  catalog: '/catalog',
  product: '/products/:productId',
  cart: '/cart',
  checkout: '/checkout',
  branches: '/branches',
  orders: '/orders',
  orderDetail: '/orders/:orderId',
  profile: '/profile',
  profileEdit: '/profile/edit',
  profileAddresses: '/profile/addresses',
} as const

export const productPath = (id: number | string) => `/products/${id}`
export const orderDetailPath = (id: string) => `/orders/${id}`
