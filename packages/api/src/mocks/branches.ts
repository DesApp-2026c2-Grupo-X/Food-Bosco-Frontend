import type { AdminBranch, BranchHours } from '@repo/domain'

const day = (dayOfWeek: number, opening: string, closing: string, closed = false): BranchHours => ({
  dayOfWeek,
  opening,
  closing,
  closed,
})

const weekday = (opening: string, closing: string) =>
  [1, 2, 3, 4, 5].map((dayOfWeek) => day(dayOfWeek, opening, closing))

export const MOCK_BRANCHES: AdminBranch[] = [
  {
    id: '1',
    name: 'Centro',
    addressText: 'Av. Vergara 1200, Hurlingham',
    latitude: -34.589,
    longitude: -58.636,
    phone: '11 5555 1111',
    active: true,
    hours: [...weekday('09:00', '23:00'), day(6, '10:00', '23:00'), day(7, '10:00', '22:00')],
  },
  {
    id: '2',
    name: 'Norte',
    addressText: 'Calle 25 de Mayo 450, Villa Tesei',
    latitude: -34.586,
    longitude: -58.63,
    phone: '11 5555 2222',
    active: true,
    hours: [...weekday('10:00', '22:00'), day(6, '11:00', '23:00'), day(7, '11:00', '21:00')],
  },
  {
    id: '3',
    name: 'Oeste',
    addressText: 'Av. Roca 600, Morón',
    latitude: -34.651,
    longitude: -58.621,
    phone: '11 5555 3333',
    active: false,
    hours: [...weekday('09:00', '21:00'), day(6, '10:00', '20:00'), day(7, '10:00', '20:00', true)],
  },
]

export const getBranchById = (id: string): AdminBranch | undefined =>
  MOCK_BRANCHES.find((branch) => branch.id === id)
