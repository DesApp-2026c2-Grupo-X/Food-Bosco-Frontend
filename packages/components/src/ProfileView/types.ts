import type { User } from '@repo/domain'

export interface ProfileViewProps {
  user: User
  description: string
}
