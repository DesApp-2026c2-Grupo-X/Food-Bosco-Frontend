export const routes = {
  home: '/',
  tripOrderDetail: '/trip/:orderId',
  history: '/history',
  profile: '/profile',
  profileEdit: '/profile/edit',
  profileVehicle: '/profile/vehicle',
} as const

export const tripOrderDetailPath = (orderId: string) => `/trip/${orderId}`
