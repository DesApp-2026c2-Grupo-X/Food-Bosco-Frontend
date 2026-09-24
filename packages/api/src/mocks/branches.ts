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
    addressText: 'Av. Gobernador Valentín Vergara 2349, Hurlingham',
    latitude: -34.595519,
    longitude: -58.636055,
    phone: '11 5555 1111',
    active: true,
    hours: [...weekday('09:00', '23:00'), day(6, '10:00', '23:00'), day(7, '10:00', '22:00')],
  },
  {
    id: '2',
    name: 'Norte',
    addressText: 'Av. Gobernador Valentín Vergara 3000, Villa Tesei',
    latitude: -34.614988,
    longitude: -58.634316,
    phone: '11 5555 2222',
    active: true,
    hours: [...weekday('10:00', '22:00'), day(6, '11:00', '23:00'), day(7, '11:00', '21:00')],
  },
  {
    id: '3',
    name: 'Oeste',
    addressText: 'Av. Rivadavia 18000, Morón',
    latitude: -34.6493555,
    longitude: -58.6172306,
    phone: '11 5555 3333',
    active: false,
    hours: [...weekday('09:00', '21:00'), day(6, '10:00', '20:00'), day(7, '10:00', '20:00', true)],
  },
]

export const getBranchById = (id: string): AdminBranch | undefined =>
  MOCK_BRANCHES.find((branch) => branch.id === id)
