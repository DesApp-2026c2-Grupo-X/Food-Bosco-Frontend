export const authRoutes = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password/:token',
} as const

export const resetPasswordPath = (token: string) => `/reset-password/${token}`
