import { describe, expect, it } from 'vitest'
import {
  formatElapsed,
  formatElapsedAgo,
  formatEta,
  formatOrderDate,
  formatOrderTime,
  formatPrice,
  getElapsedMinutes,
  getStatusSince,
  isActiveOrder,
  toTitleCase,
} from '../format'
import type { Order, OrderStatus } from '../order'

const NOW = new Date('2025-01-01T12:00:00Z').getTime()
const ago = (ms: number) => new Date(NOW - ms).toISOString()

describe('formatPrice', () => {
  it('formats ARS currency without decimals', () => {
    const formatted = formatPrice(12500)
    expect(formatted).toContain('12.500')
    expect(formatted).not.toMatch(/[.,]\d{2}$/)
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toContain('0')
  })
})

describe('toTitleCase', () => {
  it('lowercases then capitalizes each word', () => {
    expect(toTitleCase('HAMBURGUESA clásica')).toBe('Hamburguesa Clásica')
  })

  it('trims surrounding whitespace', () => {
    expect(toTitleCase('  hola  ')).toBe('Hola')
  })
})

describe('isActiveOrder', () => {
  it('treats delivered and cancelled as inactive', () => {
    expect(isActiveOrder('DELIVERED')).toBe(false)
    expect(isActiveOrder('CANCELLED')).toBe(false)
  })

  it('treats every other status as active', () => {
    const active: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_DELIVERY',
      'ON_THE_WAY',
    ]
    active.forEach((status) => expect(isActiveOrder(status)).toBe(true))
  })
})

describe('getElapsedMinutes', () => {
  it('floors partial minutes', () => {
    expect(getElapsedMinutes(ago(90_000), NOW)).toBe(1)
  })

  it('never returns negative values for future dates', () => {
    expect(getElapsedMinutes(new Date(NOW + 60_000).toISOString(), NOW)).toBe(0)
  })
})

describe('formatElapsed', () => {
  it('uses "menos de 1 min" under a minute', () => {
    expect(formatElapsed(ago(30_000), NOW)).toBe('menos de 1 min')
  })

  it('renders minutes and hours', () => {
    expect(formatElapsed(ago(5 * 60_000), NOW)).toBe('5 min')
    expect(formatElapsed(ago(65 * 60_000), NOW)).toBe('1h 5m')
    expect(formatElapsed(ago(24 * 60 * 60_000), NOW)).toBe('1d')
  })
})

describe('formatElapsedAgo', () => {
  it('returns "recién" for less than a minute', () => {
    expect(formatElapsedAgo(ago(30_000), NOW)).toBe('recién')
  })

  it('prefixes "hace" once a minute passes', () => {
    expect(formatElapsedAgo(ago(5 * 60_000), NOW)).toBe('hace 5 min')
  })
})

describe('formatEta', () => {
  const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString()

  it('renders minutes under an hour', () => {
    expect(formatEta(fromNow(30 * 60_000))).toBe('~30 min')
  })

  it('renders hours and minutes over an hour', () => {
    expect(formatEta(fromNow(90 * 60_000))).toBe('~1h 30m')
  })

  it('never goes negative for dates in the past', () => {
    expect(formatEta(fromNow(-10 * 60_000))).toBe('~0 min')
  })
})

describe('formatOrderDate / formatOrderTime', () => {
  it('produces non-empty localized strings', () => {
    const iso = '2025-03-15T14:30:00Z'
    expect(formatOrderDate(iso).length).toBeGreaterThan(0)
    expect(formatOrderTime(iso).length).toBeGreaterThan(0)
  })
})

const makeOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 'o1',
    number: '1',
    clientId: 'c1',
    branchId: 'b1',
    deliveryAddress: { text: 'x', latitude: 0, longitude: 0 },
    status: 'PENDING',
    total: 0,
    estimatedDeliveryAt: null,
    createdAt: '2025-01-01T10:00:00Z',
    items: [],
    statusHistory: [],
    availableTransitions: [],
    ...overrides,
  }) as Order

describe('getStatusSince', () => {
  it('falls back to createdAt when there is no history', () => {
    const order = makeOrder()
    expect(getStatusSince(order)).toBe(order.createdAt)
  })

  it('returns the newest history entry', () => {
    const order = makeOrder({
      statusHistory: [
        { previousStatus: 'PENDING', newStatus: 'CONFIRMED', changedAt: '2025-01-01T10:05:00Z' },
        {
          previousStatus: 'CONFIRMED',
          newStatus: 'PREPARING',
          changedAt: '2025-01-01T10:20:00Z',
        },
      ],
    })
    expect(getStatusSince(order)).toBe('2025-01-01T10:20:00Z')
  })
})
