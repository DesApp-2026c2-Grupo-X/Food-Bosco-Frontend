import type { Promotion } from '@repo/domain'

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    name: 'Promo invierno',
    description: 'Promoción de temporada.',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    active: true,
  },
  {
    id: '2',
    name: 'Promo especial',
    description: 'Promoción de fin de semana.',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    active: false,
  },
]
