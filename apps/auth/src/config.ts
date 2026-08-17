import type { UserRole } from '@repo/domain'

const STORE_URL = import.meta.env.VITE_STORE_URL ?? 'http://localhost:5173'
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174'

export const redirectByRole = (role?: UserRole) => {
  window.location.assign(role === 'admin' ? ADMIN_URL : STORE_URL)
}
