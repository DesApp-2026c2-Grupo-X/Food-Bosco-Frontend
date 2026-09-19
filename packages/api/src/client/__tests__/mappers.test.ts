import { describe, expect, it } from 'vitest'
import {
  ROLE_FROM_API,
  asBoolean,
  asList,
  asNumber,
  asString,
  toIngredient,
  toRecipeItem,
  toUser,
} from '../mappers'

describe('scalar coercion', () => {
  it('asString falls back to empty string or the provided fallback', () => {
    expect(asString(null)).toBe('')
    expect(asString(undefined, 'x')).toBe('x')
    expect(asString(0)).toBe('0')
    expect(asString(false)).toBe('false')
  })

  it('asNumber coerces nullish to 0 and keeps numbers', () => {
    expect(asNumber(null)).toBe(0)
    expect(asNumber(undefined)).toBe(0)
    expect(asNumber('1500')).toBe(1500)
    expect(asNumber(12.5)).toBe(12.5)
  })

  it('asBoolean is a truthiness cast', () => {
    expect(asBoolean(1)).toBe(true)
    expect(asBoolean(0)).toBe(false)
    expect(asBoolean(null)).toBe(false)
    expect(asBoolean('')).toBe(false)
    expect(asBoolean('false')).toBe(true)
  })

  it('asList maps arrays and defaults to empty for non-arrays', () => {
    expect(asList([1, 2], (n) => Number(n) * 2)).toEqual([2, 4])
    expect(asList(null, (n) => n)).toEqual([])
    expect(asList({ 0: 'a' }, (n) => n)).toEqual([])
  })
})

describe('ROLE_FROM_API', () => {
  it('maps all API roles to domain roles', () => {
    expect(ROLE_FROM_API).toEqual({
      CUSTOMER: 'customer',
      BRANCH_ADMIN: 'branch_admin',
      SUPER_ADMIN: 'super_admin',
      RIDER: 'rider',
    })
  })
})

describe('toUser', () => {
  it('maps fields and unknown roles fall back to customer', () => {
    const user = toUser({
      id: 'u1',
      email: 'a@b.com',
      role: 'SOMETHING',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '123',
      active: true,
      branchId: 'b1',
    })
    expect(user).toMatchObject({
      id: 'u1',
      email: 'a@b.com',
      role: 'customer',
      firstName: 'Ana',
      lastName: 'Perez',
      phone: '123',
      active: true,
      branchId: 'b1',
    })
    expect(typeof user.createdAt).toBe('string')
  })

  it('maps SUPER_ADMIN and leaves missing branchId undefined', () => {
    const user = toUser({ role: 'SUPER_ADMIN' })
    expect(user.role).toBe('super_admin')
    expect(user.branchId).toBeUndefined()
  })
})

describe('toIngredient', () => {
  it('maps an ingredient', () => {
    expect(toIngredient({ id: 'i1', name: 'Pan', unit: 'un', active: true })).toEqual({
      id: 'i1',
      name: 'Pan',
      unit: 'un',
      active: true,
    })
  })
})

describe('toRecipeItem', () => {
  it('maps without ingredient by default', () => {
    expect(toRecipeItem({ id: 'r1', ingredientId: 'i1', quantity: '2' })).toEqual({
      id: 'r1',
      ingredientId: 'i1',
      quantity: 2,
    })
  })

  it('nests the ingredient when requested', () => {
    const item = toRecipeItem(
      { id: 'r1', ingredientId: 'i1', quantity: 3, ingredient: { id: 'i1', name: 'Pan' } },
      true,
    )
    expect(item.ingredient).toMatchObject({ id: 'i1', name: 'Pan' })
  })
})
