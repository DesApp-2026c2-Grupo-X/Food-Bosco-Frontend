import { describe, expect, it } from 'vitest'
import { toAddress, toUser, type ApiAddress, type MeUser } from '../operations'

const me = (overrides: Partial<MeUser> = {}): MeUser => ({
  id: 'u1',
  email: 'a@b.com',
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '123',
  role: 'CUSTOMER',
  active: true,
  branchId: 'b1',
  vehicle: null,
  ...overrides,
})

const address = (overrides: Partial<ApiAddress> = {}): ApiAddress => ({
  id: 'a1',
  label: 'Casa',
  text: 'Calle 1',
  city: null,
  postalCode: null,
  latitude: -34.6,
  longitude: -58.4,
  active: true,
  ...overrides,
})

describe('toUser (operations)', () => {
  it('passes the active flag through without coercing it', () => {
    expect(toUser(me({ active: false })).active).toBe(false)
    expect(toUser(me({ active: undefined as unknown as boolean })).active).toBeUndefined()
  })

  it('maps a null phone to an empty string', () => {
    expect(toUser(me({ phone: null })).phone).toBe('')
  })

  it('drops a null branchId and maps an unknown role to customer', () => {
    const user = toUser(me({ branchId: null, role: 'NOT_A_ROLE' }))

    expect(user.branchId).toBeUndefined()
    expect(user.role).toBe('customer')
  })
})

describe('toAddress', () => {
  it('preserves null city and postalCode', () => {
    const mapped = toAddress(address())

    expect(mapped.city).toBeNull()
    expect(mapped.postalCode).toBeNull()
  })

  it('keeps the numeric coordinates and scalar fields', () => {
    expect(toAddress(address({ label: 'Trabajo', city: 'Bernal', postalCode: '1876' }))).toEqual({
      id: 'a1',
      label: 'Trabajo',
      text: 'Calle 1',
      city: 'Bernal',
      postalCode: '1876',
      latitude: -34.6,
      longitude: -58.4,
      active: true,
    })
  })
})
