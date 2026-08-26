import type { Branch } from '@repo/domain'

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 1,
    name: 'Sucursal Centro',
    address: 'Av. Vergara 1200, Hurlingham',
    phone: '11 5555-0101',
    hours: '09:00 a 23:00',
    open: true,
    distanceKm: 1.2,
  },
  {
    id: 2,
    name: 'Sucursal Norte',
    address: 'Calle 25 de Mayo 450, Villa Tesei',
    phone: '11 5555-0102',
    hours: '10:00 a 22:00',
    open: true,
    distanceKm: 3.8,
  },
  {
    id: 3,
    name: 'Sucursal Oeste',
    address: 'Ruta 8 km 21, William Morris',
    phone: '11 5555-0103',
    hours: '11:00 a 21:00',
    open: false,
    distanceKm: 6.4,
  },
]
