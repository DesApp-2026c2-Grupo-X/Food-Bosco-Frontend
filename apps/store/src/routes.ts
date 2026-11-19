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
  activity: '/profile/activity',
} as const

export const FOR_YOU_CATEGORY = 'for-you'
export const catalogForYouPath = `/catalog?cat=${FOR_YOU_CATEGORY}`

export const productPath = (id: number | string) => `/products/${id}`
export const orderDetailPath = (id: string) => `/orders/${id}`
