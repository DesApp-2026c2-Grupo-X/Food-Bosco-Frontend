import { z } from 'zod'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s().-]{7,}$/

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .regex(EMAIL_RE, 'Ingresá un email válido')

export const passwordSchema = z
  .string()
  .min(1, 'Este campo es requerido')
  .max(128, 'Máximo 128 caracteres')

export const newPasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(128, 'Máximo 128 caracteres')

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .max(100, 'Máximo 100 caracteres')

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .regex(PHONE_RE, 'Ingresá un teléfono válido')
  .max(50, 'Máximo 50 caracteres')

const confirmPassword = z.string().min(1, 'Este campo es requerido')

const numberField = (message = 'Ingresá un número') =>
  z
    .string()
    .trim()
    .min(1, 'Este campo es requerido')
    .regex(/^-?\d+(\.\d+)?$/, message)

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: newPasswordSchema,
    confirm: confirmPassword,
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const registerFormSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: newPasswordSchema,
    confirm: confirmPassword,
    role: z.enum(['customer', 'rider']),
    vehicleType: z.enum(['moto', 'bici']),
    brand: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    model: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    plate: z.string().trim().max(20, 'Máximo 20 caracteres').optional(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })
  .superRefine((data, ctx) => {
    if (data.role !== 'rider') return
    if (data.vehicleType === 'bici') return

    if (!data.brand) {
      ctx.addIssue({ code: 'custom', message: 'La marca es obligatoria', path: ['brand'] })
    }
    if (!data.model) {
      ctx.addIssue({ code: 'custom', message: 'El modelo es obligatorio', path: ['model'] })
    }
    if (!data.plate) {
      ctx.addIssue({ code: 'custom', message: 'La patente es obligatoria', path: ['plate'] })
    }

    const vehicle = ['Moto', data.brand?.trim(), data.model?.trim(), data.plate?.trim()]
      .filter(Boolean)
      .join(' · ')
    if (vehicle.length > 100) {
      ctx.addIssue({
        code: 'custom',
        message: 'La descripción del vehículo no puede superar los 100 caracteres',
        path: ['brand'],
      })
    }
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirm: confirmPassword,
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const addressSchema = z.object({
  label: z.string().trim().max(100, 'Máximo 100 caracteres'),
  text: z.string().trim().min(1, 'Este campo es requerido').max(300, 'Máximo 300 caracteres'),
  city: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  postalCode: z.string().trim().max(20, 'Máximo 20 caracteres').optional(),
})

export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
})

export const riderProfileSchema = z.object({
  phone: phoneSchema,
})

export const vehicleSchema = z
  .object({
    type: z.enum(['moto', 'bici']),
    brand: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    model: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    plate: z.string().trim().max(20, 'Máximo 20 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'moto') return
    if (!data.brand?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'La marca es obligatoria', path: ['brand'] })
    }
    if (!data.model?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'El modelo es obligatorio', path: ['model'] })
    }
    if (!data.plate?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'La patente es obligatoria', path: ['plate'] })
    }
  })

export const adjustStockSchema = z.object({
  delta: numberField('Ingresá un número').refine(
    (value) => Number(value) !== 0,
    'La cantidad no puede ser 0',
  ),
  reason: z.string().trim().optional(),
})

export type AdjustStockForm = z.infer<typeof adjustStockSchema>

export const categorySchema = z.object({
  name: nameSchema,
})

const descriptionSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .max(500, 'Máximo 500 caracteres')

const isoDateSchema = z
  .string()
  .trim()
  .min(1, 'Ingresá una fecha')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Ingresá una fecha válida')

export const ingredientSchema = z.object({
  name: nameSchema,
  unit: z.string().trim().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
})

export const productSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  categoryId: z.string().trim().min(1, 'Seleccioná una categoría'),
  price: numberField('Ingresá un precio válido').refine(
    (value) => Number(value) >= 0,
    'El precio no puede ser negativo',
  ),
  image: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
})

export const branchSchema = z.object({
  name: nameSchema,
  addressText: z
    .string()
    .trim()
    .min(1, 'Este campo es requerido')
    .max(200, 'Máximo 200 caracteres'),
  latitude: numberField('Ingresá una latitud válida').refine(
    (value) => Number(value) >= -90 && Number(value) <= 90,
    'Latitud fuera de rango',
  ),
  longitude: numberField('Ingresá una longitud válida').refine(
    (value) => Number(value) >= -180 && Number(value) <= 180,
    'Longitud fuera de rango',
  ),
  phone: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
})

export const promotionSchema = z
  .object({
    name: nameSchema,
    description: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
  })
  .refine((data) => Date.parse(data.endDate) >= Date.parse(data.startDate), {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['endDate'],
  })

const staffBase = {
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z
    .string()
    .trim()
    .refine((value) => value === 'branch_admin' || value === 'super_admin', 'Seleccioná un rol'),
  branchId: z.string().trim().optional(),
}

const requireBranchForCollaborator = (data: { role: string; branchId?: string }) =>
  data.role !== 'branch_admin' || (data.branchId != null && data.branchId.length > 0)

export const staffCreateSchema = z
  .object({
    ...staffBase,
    password: newPasswordSchema,
  })
  .refine(requireBranchForCollaborator, {
    message: 'La sucursal es obligatoria para un colaborador',
    path: ['branchId'],
  })

export const staffUpdateSchema = z.object(staffBase).refine(requireBranchForCollaborator, {
  message: 'La sucursal es obligatoria para un colaborador',
  path: ['branchId'],
})

export const parameterSchema = z.object({
  value: numberField('Ingresá un valor válido').refine(
    (value) => Number(value) > 0,
    'El valor debe ser mayor a 0',
  ),
})

const nonNegativeIntField = (message: string) =>
  numberField(message).refine(
    (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
    'Ingresá un entero mayor o igual a 0',
  )

export const orderStateSchema = z.object({
  name: nameSchema,
  order: nonNegativeIntField('Ingresá un orden válido'),
})

export const configGroupSchema = z
  .object({
    name: nameSchema,
    type: z.enum(['single', 'multiple'], { message: 'Seleccioná un tipo' }),
    min: nonNegativeIntField('Ingresá un mínimo válido'),
    max: nonNegativeIntField('Ingresá un máximo válido'),
  })
  .refine((data) => Number(data.max) >= Number(data.min), {
    message: 'El máximo no puede ser menor que el mínimo',
    path: ['max'],
  })

export const configOptionSchema = z.object({
  name: nameSchema,
  extraPrice: numberField('Ingresá una variación válida'),
})

export const recipeItemSchema = z.object({
  ingredientId: z.string().trim().min(1, 'Seleccioná un ingrediente'),
  quantity: numberField('Ingresá una cantidad válida').refine(
    (value) => Number(value) > 0,
    'La cantidad debe ser mayor a 0',
  ),
})

export type CategoryForm = z.infer<typeof categorySchema>
export type IngredientForm = z.infer<typeof ingredientSchema>
export type ProductForm = z.infer<typeof productSchema>
export type BranchForm = z.infer<typeof branchSchema>
export type PromotionForm = z.infer<typeof promotionSchema>
export type StaffCreateForm = z.infer<typeof staffCreateSchema>
export type StaffUpdateForm = z.infer<typeof staffUpdateSchema>
export type ParameterForm = z.infer<typeof parameterSchema>
export type OrderStateForm = z.infer<typeof orderStateSchema>
export type ConfigGroupForm = z.infer<typeof configGroupSchema>
export type ConfigOptionForm = z.infer<typeof configOptionSchema>
export type RecipeItemForm = z.infer<typeof recipeItemSchema>
