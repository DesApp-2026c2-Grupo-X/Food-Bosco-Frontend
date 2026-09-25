export const authRoutes = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const

export const resetPasswordPath = (token: string) =>
  `${authRoutes.resetPassword}?token=${encodeURIComponent(token)}`
