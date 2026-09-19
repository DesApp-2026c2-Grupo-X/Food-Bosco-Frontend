import type { User } from '@repo/domain'

export const MOCK_SUPER_ADMIN: User = {
  id: 'super-admin-1',
  email: 'thomas.garcia@foodbosco.com',
  role: 'super_admin',
  firstName: 'Thomas',
  lastName: 'García',
  phone: '+54 11 5555 0000',
  active: true,
  createdAt: '2025-01-01T09:00:00',
}
