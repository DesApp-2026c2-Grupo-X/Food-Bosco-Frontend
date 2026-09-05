import type { StaffMember, User } from '@repo/domain'

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

export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'super-admin-1',
    firstName: 'Thomas',
    lastName: 'García',
    email: 'thomas.garcia@foodbosco.com',
    phone: '+54 11 5555 0000',
    role: 'super_admin',
    active: true,
  },
  {
    id: 'staff-1',
    firstName: 'Mateo',
    lastName: 'Álvarez',
    email: 'mateo.alvarez@foodbosco.com',
    phone: '+54 11 5555 1111',
    role: 'branch_admin',
    active: true,
    branchId: '1',
    branchName: 'Centro',
  },
  {
    id: 'staff-2',
    firstName: 'Bosco',
    lastName: 'Vega',
    email: 'bosco.vega@foodbosco.com',
    phone: '+54 11 5555 2222',
    role: 'branch_admin',
    active: true,
    branchId: '2',
    branchName: 'Norte',
  },
]
