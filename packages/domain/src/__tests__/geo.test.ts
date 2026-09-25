import { describe, expect, it } from 'vitest'
import { formatDistance, haversineDistanceMeters } from '../geo'
import { tripDeliveryDistanceMeters, type TripOrder } from '../trip'
import { buildVehicleDescription, formatVehicle } from '../rider'
import { toAddressInput } from '../address'

describe('haversineDistanceMeters', () => {
  it('is zero for the same point', () => {
    const point = { latitude: -34.6, longitude: -58.4 }
    expect(haversineDistanceMeters(point, point)).toBe(0)
  })

  it('is roughly 111 km per degree of latitude', () => {
    const distance = haversineDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 },
    )
    expect(distance).toBeGreaterThan(110_000)
    expect(distance).toBeLessThan(112_000)
  })
})

describe('formatDistance', () => {
  it('uses meters under a kilometer', () => {
    expect(formatDistance(850)).toBe('850 m')
  })

  it('uses kilometers with one decimal above a kilometer', () => {
    expect(formatDistance(1500)).toBe('1.5 km')
  })

  it('renders an em dash for non-finite values', () => {
    expect(formatDistance(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatDistance(Number.NaN)).toBe('—')
  })
})

describe('tripDeliveryDistanceMeters', () => {
  it('sums every branch-to-delivery leg', () => {
    const orders = [
      {
        pickupLocation: { latitude: 0, longitude: 0 },
        deliveryAddress: { latitude: 1, longitude: 0 },
      },
      {
        pickupLocation: { latitude: 0, longitude: 0 },
        deliveryAddress: { latitude: 2, longitude: 0 },
      },
    ] as TripOrder[]
    const total = tripDeliveryDistanceMeters(orders)
    expect(total).toBeGreaterThan(330_000)
    expect(total).toBeLessThan(334_000)
  })

  it('is zero without orders', () => {
    expect(tripDeliveryDistanceMeters([])).toBe(0)
  })
})

describe('vehicle description', () => {
  it('returns "Bici" for bikes', () => {
    expect(buildVehicleDescription({ type: 'bici' })).toBe('Bici')
  })

  it('joins moto fields with a separator', () => {
    expect(
      buildVehicleDescription({ type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' }),
    ).toBe('Moto · Honda · CG · AB123')
  })

  it('omits missing moto fields', () => {
    expect(buildVehicleDescription({ type: 'moto', brand: 'Honda' })).toBe('Moto · Honda')
  })

  it('formatVehicle mirrors buildVehicleDescription', () => {
    expect(formatVehicle({ type: 'bici' })).toBe('Bici')
  })
})

describe('toAddressInput', () => {
  it('title-cases label, text and city and trims postal code', () => {
    const result = toAddressInput({
      label: '  casa  ',
      text: 'av. santa fe',
      city: 'caba',
      postalCode: ' 1425 ',
      latitude: 1,
      longitude: 2,
    })
    expect(result).toEqual({
      label: 'Casa',
      text: 'Av. Santa Fe',
      city: 'Caba',
      postalCode: '1425',
      latitude: 1,
      longitude: 2,
    })
  })

  it('defaults an empty label to "Dirección"', () => {
    const result = toAddressInput({ label: '   ', text: 'calle 1', latitude: 0, longitude: 0 })
    expect(result.label).toBe('Dirección')
  })

  it('drops empty city and postal code', () => {
    const result = toAddressInput({
      label: 'Casa',
      text: 'calle 1',
      city: '',
      postalCode: '',
      latitude: 0,
      longitude: 0,
    })
    expect(result.city).toBeUndefined()
    expect(result.postalCode).toBeUndefined()
  })
})
