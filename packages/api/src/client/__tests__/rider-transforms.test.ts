import { describe, expect, it } from 'vitest'
import { toRider, toTrip, toTripOffer, toTripOrder } from '../rider'

describe('toRider', () => {
  it('maps the profile and preserves raw vehicle fields', () => {
    const rider = toRider({
      id: 'r1',
      userId: 'u1',
      firstName: 'Juan',
      lastName: null,
      phone: null,
      available: 1,
      vehicle: { type: 'bici', brand: 'x', model: 'y', plate: 'z' },
    })
    expect(rider).toMatchObject({
      id: 'r1',
      userId: 'u1',
      firstName: 'Juan',
      lastName: null,
      phone: null,
      available: true,
    })
    expect(rider.vehicle.type).toBe('bici')
  })

  it('defaults an unknown vehicle type to moto', () => {
    expect(toRider({ vehicle: { type: 'camion' } }).vehicle.type).toBe('moto')
  })

  it('keeps moto fields and maps current location', () => {
    const rider = toRider({
      vehicle: { type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' },
      currentLocation: { latitude: '-34.6', longitude: '-58.4' },
    })
    expect(rider.vehicle).toEqual({ type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' })
    expect(rider.currentLocation).toEqual({ latitude: -34.6, longitude: -58.4 })
  })

  it('defaults current location to null', () => {
    expect(toRider({ vehicle: {} }).currentLocation).toBeNull()
  })
})

describe('toTripOffer', () => {
  it('maps offer metrics and nullable expiry', () => {
    const offer = toTripOffer({
      id: 'of1',
      orderCount: '2',
      distanceKm: '5.5',
      estimatedMinutes: '20',
      estimatedEarnings: '1500',
      expiresAt: null,
    })
    expect(offer).toEqual({
      id: 'of1',
      orderCount: 2,
      distanceKm: 5.5,
      estimatedMinutes: 20,
      estimatedEarnings: 1500,
      expiresAt: null,
    })
  })
})

describe('toTripOrder', () => {
  it('maps pickup and delivery addresses', () => {
    const order = toTripOrder({
      orderId: 'o1',
      pickupBranchId: 'b1',
      pickupLocation: { latitude: 1, longitude: 2 },
      deliveryAddress: { text: 'Calle', latitude: 3, longitude: 4 },
      status: 'ON_THE_WAY',
      pickedUpAt: '2025-01-01T10:00:00Z',
      deliveredAt: null,
    })
    expect(order.pickupLocation).toEqual({ latitude: 1, longitude: 2 })
    expect(order.deliveryAddress).toEqual({ text: 'Calle', latitude: 3, longitude: 4 })
    expect(order.deliveredAt).toBeNull()
  })
})

describe('toTrip', () => {
  it('maps earnings, orders and lifecycle timestamps', () => {
    const trip = toTrip({
      id: 't1',
      riderId: 'r1',
      status: 'ACTIVE',
      orders: [],
      distanceKm: '3',
      estimatedMinutes: '10',
      estimatedEarnings: '900',
      earnings: null,
      startedAt: '2025-01-01T10:00:00Z',
      completedAt: null,
      expiresAt: null,
    })
    expect(trip).toMatchObject({
      id: 't1',
      status: 'ACTIVE',
      distanceKm: 3,
      estimatedEarnings: 900,
      earnings: null,
      completedAt: null,
    })
    expect(trip.orders).toEqual([])
  })

  it('keeps numeric earnings when present', () => {
    expect(toTrip({ earnings: '1234' }).earnings).toBe(1234)
  })
})
