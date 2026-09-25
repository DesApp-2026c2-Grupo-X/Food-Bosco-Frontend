import { describe, expect, it } from 'vitest'
import {
  addressSchema,
  adjustStockSchema,
  branchSchema,
  categorySchema,
  configGroupSchema,
  configOptionSchema,
  emailSchema,
  forgotPasswordSchema,
  ingredientSchema,
  loginSchema,
  newPasswordSchema,
  orderStateSchema,
  parameterSchema,
  passwordSchema,
  productSchema,
  profileSchema,
  promotionSchema,
  recipeItemSchema,
  registerFormSchema,
  registerSchema,
  resetPasswordSchema,
  staffCreateSchema,
  staffUpdateSchema,
  vehicleSchema,
} from '../schemas'

const issuePaths = (result: {
  success: boolean
  error?: { issues: { path: (string | number)[] }[] }
}) => (result.success ? [] : (result.error?.issues ?? []).map((issue) => issue.path.join('.')))
const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? '' : (result.error?.issues[0]?.message ?? '')

const validStaff = {
  firstName: 'Ana',
  lastName: 'Perez',
  email: 'ana@bosco.com',
  phone: '+54 11 5555-1234',
  role: 'branch_admin',
  branchId: 'b1',
}

describe('emailSchema', () => {
  it('rejects empty, invalid and accepts valid emails', () => {
    expect(emailSchema.safeParse('').success).toBe(false)
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    expect(emailSchema.safeParse('ana@bosco.com').success).toBe(true)
  })

  it('trims whitespace before validating', () => {
    const result = emailSchema.safeParse('  ana@bosco.com  ')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('ana@bosco.com')
  })
})

describe('passwordSchema vs newPasswordSchema', () => {
  it('login password only requires non-empty', () => {
    expect(passwordSchema.safeParse('x').success).toBe(true)
    expect(passwordSchema.safeParse('').success).toBe(false)
  })

  it('new password enforces at least 8 characters', () => {
    expect(newPasswordSchema.safeParse('1234567').success).toBe(false)
    expect(newPasswordSchema.safeParse('12345678').success).toBe(true)
  })

  it('both reject passwords over 128 characters', () => {
    const long = 'a'.repeat(129)
    expect(passwordSchema.safeParse(long).success).toBe(false)
    expect(newPasswordSchema.safeParse(long).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('validates email and password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  const base = {
    firstName: 'Ana',
    lastName: 'Perez',
    email: 'ana@bosco.com',
    phone: '+54 11 5555-1234',
    password: '12345678',
    confirm: '12345678',
  }

  it('accepts matching passwords', () => {
    expect(registerSchema.safeParse(base).success).toBe(true)
  })

  it('flags mismatched passwords on the confirm field', () => {
    const result = registerSchema.safeParse({ ...base, confirm: '87654321' })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('confirm')
  })

  it('rejects invalid phone numbers', () => {
    const result = registerSchema.safeParse({ ...base, phone: 'abc' })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('phone')
  })
})

describe('registerFormSchema — rider vehicle rules', () => {
  const base = {
    firstName: 'Ana',
    lastName: 'Perez',
    email: 'ana@bosco.com',
    phone: '+54 11 5555-1234',
    password: '12345678',
    confirm: '12345678',
    role: 'rider' as const,
    vehicleType: 'moto' as const,
    brand: 'Honda',
    model: 'CG 125',
    plate: 'AB 123 CD',
  }

  it('accepts a complete moto rider', () => {
    expect(registerFormSchema.safeParse(base).success).toBe(true)
  })

  it('requires brand, model and plate for a moto', () => {
    const result = registerFormSchema.safeParse({ ...base, brand: '', model: '', plate: '' })
    expect(result.success).toBe(false)
    const paths = issuePaths(result)
    expect(paths).toEqual(expect.arrayContaining(['brand', 'model', 'plate']))
  })

  it('does not require vehicle fields for a bike', () => {
    const result = registerFormSchema.safeParse({
      ...base,
      vehicleType: 'bici',
      brand: '',
      model: '',
      plate: '',
    })
    expect(result.success).toBe(true)
  })

  it('does not require vehicle fields for a customer', () => {
    const result = registerFormSchema.safeParse({
      ...base,
      role: 'customer',
      brand: '',
      model: '',
      plate: '',
    })
    expect(result.success).toBe(true)
  })

  it('caps the full vehicle description at 100 characters', () => {
    const result = registerFormSchema.safeParse({
      ...base,
      brand: 'x'.repeat(50),
      model: 'y'.repeat(48),
      plate: 'z',
    })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('brand')
  })
})

describe('password recovery schemas', () => {
  it('forgot password needs a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })

  it('reset password enforces new password rules and matching', () => {
    expect(
      resetPasswordSchema.safeParse({ password: '12345678', confirm: '12345678' }).success,
    ).toBe(true)
    expect(resetPasswordSchema.safeParse({ password: '1234567', confirm: '1234567' }).success).toBe(
      false,
    )
    const mismatch = resetPasswordSchema.safeParse({ password: '12345678', confirm: '12345679' })
    expect(mismatch.success).toBe(false)
    expect(issuePaths(mismatch)).toContain('confirm')
  })
})

describe('addressSchema', () => {
  it('requires text and respects limits', () => {
    expect(addressSchema.safeParse({ label: '', text: 'Av. Siempreviva 742' }).success).toBe(true)
    expect(addressSchema.safeParse({ label: '', text: '' }).success).toBe(false)
    expect(addressSchema.safeParse({ label: '', text: 'a'.repeat(301) }).success).toBe(false)
    expect(addressSchema.safeParse({ text: 'ok', label: 'a'.repeat(101) }).success).toBe(false)
  })
})

describe('profileSchema / vehicleSchema', () => {
  it('profile requires names and phone', () => {
    expect(
      profileSchema.safeParse({ firstName: 'A', lastName: 'B', phone: '+54 11 5555-1234' }).success,
    ).toBe(true)
    expect(profileSchema.safeParse({ firstName: '', lastName: 'B', phone: '123' }).success).toBe(
      false,
    )
  })

  it('vehicle requires brand/model/plate only for motos', () => {
    expect(vehicleSchema.safeParse({ type: 'bici' }).success).toBe(true)
    expect(vehicleSchema.safeParse({ type: 'moto' }).success).toBe(false)
    expect(
      vehicleSchema.safeParse({ type: 'moto', brand: 'Honda', model: 'CG', plate: 'AB123' })
        .success,
    ).toBe(true)
  })
})

describe('adjustStockSchema / parameterSchema / orderStateSchema', () => {
  it('rejects a zero stock adjustment', () => {
    expect(adjustStockSchema.safeParse({ delta: '0' }).success).toBe(false)
    expect(adjustStockSchema.safeParse({ delta: '5' }).success).toBe(true)
    expect(adjustStockSchema.safeParse({ delta: '-3', reason: 'merma' }).success).toBe(true)
    expect(adjustStockSchema.safeParse({ delta: 'abc' }).success).toBe(false)
  })

  it('parameter must be a positive number', () => {
    expect(parameterSchema.safeParse({ value: '0' }).success).toBe(false)
    expect(parameterSchema.safeParse({ value: '-1' }).success).toBe(false)
    expect(parameterSchema.safeParse({ value: '2.5' }).success).toBe(true)
  })

  it('order state must be a non-negative integer', () => {
    expect(orderStateSchema.safeParse({ name: 'Listo', order: '3' }).success).toBe(true)
    expect(orderStateSchema.safeParse({ name: 'Listo', order: '-1' }).success).toBe(false)
    expect(orderStateSchema.safeParse({ name: 'Listo', order: '1.5' }).success).toBe(false)
  })
})

describe('catalog schemas', () => {
  it('category requires a name', () => {
    expect(categorySchema.safeParse({ name: 'Bebidas' }).success).toBe(true)
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('ingredient requires name and unit', () => {
    expect(ingredientSchema.safeParse({ name: 'Pan', unit: 'un' }).success).toBe(true)
    expect(ingredientSchema.safeParse({ name: 'Pan', unit: '' }).success).toBe(false)
  })

  it('product rejects negative prices and missing category', () => {
    const base = { name: 'Burger', description: 'Rica', categoryId: 'c1', price: '1000' }
    expect(productSchema.safeParse(base).success).toBe(true)
    expect(productSchema.safeParse({ ...base, price: '-10' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, categoryId: '' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, description: '' }).success).toBe(false)
  })

  it('branch validates latitude/longitude ranges', () => {
    const base = { name: 'Centro', addressText: 'Calle 1', latitude: '0', longitude: '0' }
    expect(branchSchema.safeParse(base).success).toBe(true)
    expect(branchSchema.safeParse({ ...base, latitude: '91' }).success).toBe(false)
    expect(branchSchema.safeParse({ ...base, longitude: '181' }).success).toBe(false)
    expect(branchSchema.safeParse({ ...base, latitude: '-90', longitude: '180' }).success).toBe(
      true,
    )
  })

  it('promotion requires end date on or after start date', () => {
    const base = { name: 'Promo', startDate: '2025-01-01', endDate: '2025-01-31' }
    expect(promotionSchema.safeParse(base).success).toBe(true)
    expect(promotionSchema.safeParse({ ...base, endDate: '2024-12-31' }).success).toBe(false)
    expect(promotionSchema.safeParse({ ...base, startDate: 'not-a-date' }).success).toBe(false)
  })

  it('config group requires max >= min and a valid type', () => {
    const base = { name: 'Tamaño', type: 'single', min: '1', max: '1' }
    expect(configGroupSchema.safeParse(base).success).toBe(true)
    expect(configGroupSchema.safeParse({ ...base, min: '2', max: '1' }).success).toBe(false)
    expect(configGroupSchema.safeParse({ ...base, type: 'nope' }).success).toBe(false)
  })

  it('config option validates name and numeric price variation', () => {
    expect(configOptionSchema.safeParse({ name: 'Queso', extraPrice: '100' }).success).toBe(true)
    expect(configOptionSchema.safeParse({ name: '', extraPrice: '100' }).success).toBe(false)
    expect(configOptionSchema.safeParse({ name: 'Queso', extraPrice: 'x' }).success).toBe(false)
  })

  it('recipe item requires an ingredient and positive quantity', () => {
    expect(recipeItemSchema.safeParse({ ingredientId: 'i1', quantity: '2' }).success).toBe(true)
    expect(recipeItemSchema.safeParse({ ingredientId: '', quantity: '2' }).success).toBe(false)
    expect(recipeItemSchema.safeParse({ ingredientId: 'i1', quantity: '0' }).success).toBe(false)
  })
})

describe('staff schemas', () => {
  it('super admin does not need a branch', () => {
    const result = staffCreateSchema.safeParse({
      ...validStaff,
      role: 'super_admin',
      branchId: '',
      password: '12345678',
    })
    expect(result.success).toBe(true)
  })

  it('branch admin requires a branch', () => {
    const result = staffCreateSchema.safeParse({
      ...validStaff,
      branchId: '',
      password: '12345678',
    })
    expect(result.success).toBe(false)
    expect(issuePaths(result)).toContain('branchId')
  })

  it('rejects unknown roles', () => {
    const result = staffUpdateSchema.safeParse({ ...validStaff, role: 'customer' })
    expect(result.success).toBe(false)
    expect(firstMessage(result)).toBe('Seleccioná un rol')
  })

  it('staff create requires a valid password', () => {
    expect(staffCreateSchema.safeParse({ ...validStaff, password: '123' }).success).toBe(false)
  })
})
