import type { UserRole } from '@repo/domain'

export interface RequireAuthProps {
  loginPath: string
  roles?: UserRole[]
  mockAuth?: boolean
}
