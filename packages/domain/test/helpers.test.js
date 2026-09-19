import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  formatDistance,
  formatElapsedAgo,
  getElapsedMinutes,
  haversineDistanceMeters,
  isStaffRole,
  tripDeliveryDistanceMeters,
} from '../dist/index.js'

const NOW = new Date('2025-01-01T12:00:00Z').getTime()
const ago = (ms) => new Date(NOW - ms).toISOString()

describe('formatElapsedAgo', () => {
  it('returns "recién" for less than a minute', () => {
    assert.equal(formatElapsedAgo(ago(30_000), NOW), 'recién')
  })

  it('prefixes "hace" once a minute has passed', () => {
    assert.equal(formatElapsedAgo(ago(5 * 60_000), NOW), 'hace 5 min')
  })
})

describe('getElapsedMinutes', () => {
  it('floors partial minutes', () => {
    assert.equal(getElapsedMinutes(ago(90_000), NOW), 1)
  })
})

describe('formatDistance', () => {
  it('formats meters and kilometers', () => {
    assert.equal(formatDistance(850), '850 m')
    assert.equal(formatDistance(1500), '1.5 km')
    assert.equal(formatDistance(Number.POSITIVE_INFINITY), '—')
  })
})

describe('haversineDistanceMeters', () => {
  it('is zero for the same point', () => {
    assert.equal(
      haversineDistanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }),
      0,
    )
  })

  it('is roughly 111 km per degree of latitude', () => {
    const distance = haversineDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 },
    )
    assert.ok(distance > 110_000 && distance < 112_000)
  })
})

describe('tripDeliveryDistanceMeters', () => {
  it('sums the branch-to-delivery leg of every order', () => {
    const orders = [
      {
        pickupLocation: { latitude: 0, longitude: 0 },
        deliveryAddress: { latitude: 1, longitude: 0 },
      },
      {
        pickupLocation: { latitude: 0, longitude: 0 },
        deliveryAddress: { latitude: 2, longitude: 0 },
      },
    ]
    const total = tripDeliveryDistanceMeters(orders)
    assert.ok(total > 330_000 && total < 334_000)
  })
})

describe('isStaffRole', () => {
  it('accepts staff roles and rejects normal users', () => {
    assert.equal(isStaffRole('branch_admin'), true)
    assert.equal(isStaffRole('super_admin'), true)
    assert.equal(isStaffRole('customer'), false)
    assert.equal(isStaffRole('rider'), false)
  })
})
