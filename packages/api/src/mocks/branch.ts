import type { User } from '@repo/domain'

export const MOCK_BRANCH_NAME = 'Centro'

export const MOCK_BRANCH_ADMIN: User = {
  id: 'branch-admin-1',
  email: 'julian.sosa@foodbosco.com',
  role: 'branch_admin',
  firstName: 'Julián',
  lastName: 'Sosa',
  phone: '+54 11 5555 1234',
  active: true,
  createdAt: '2025-01-15T09:00:00',
}
