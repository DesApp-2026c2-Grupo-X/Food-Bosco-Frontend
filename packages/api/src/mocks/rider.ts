import type { RiderProfile, User } from '@repo/domain'

export const MOCK_RIDER_USER: User = {
  id: 'user-rider-1',
  email: 'marcos.peralta@foodbosco.com',
  role: 'rider',
  firstName: 'Marcos',
  lastName: 'Peralta',
  phone: '+54 11 5555 6789',
  active: true,
  createdAt: '2025-02-01T08:00:00',
}

export const MOCK_RIDER_PROFILE: RiderProfile = {
  id: 'rider-1',
  userId: MOCK_RIDER_USER.id,
  vehicle: { type: 'moto', marca: 'Honda', modelo: 'CG Titan', patente: 'HLP 482' },
  phone: MOCK_RIDER_USER.phone,
  available: true,
  currentLocation: { latitude: -34.59, longitude: -58.641 },
}
