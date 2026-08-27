import { z } from 'zod'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s().-]{7,}$/

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .regex(EMAIL_RE, 'Ingresá un email válido')

export const passwordSchema = z.string().min(6, 'Mínimo 6 caracteres')

export const nameSchema = z.string().trim().min(1, 'Este campo es requerido')

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .regex(PHONE_RE, 'Ingresá un teléfono válido')

const confirmPassword = z.string().min(1, 'Este campo es requerido')

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
    password: passwordSchema,
    confirm: confirmPassword,
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: confirmPassword,
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const addressSchema = z.object({
  label: z.string().trim(),
  text: z.string().trim().min(1, 'Este campo es requerido'),
  city: z.string().trim().min(1, 'Este campo es requerido'),
  postalCode: z.string().trim().min(1, 'Este campo es requerido'),
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
    marca: z.string().trim().optional(),
    modelo: z.string().trim().optional(),
    patente: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'moto') return
    if (!data.marca?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'La marca es obligatoria', path: ['marca'] })
    }
    if (!data.modelo?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'El modelo es obligatorio', path: ['modelo'] })
    }
    if (!data.patente?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'La patente es obligatoria', path: ['patente'] })
    }
  })

export const adjustStockSchema = z.object({
  delta: z
    .string()
    .trim()
    .min(1, 'Ingresá una cantidad')
    .regex(/^-?\d+$/, 'Ingresá un número entero')
    .refine((value) => Number(value) !== 0, 'La cantidad no puede ser 0'),
  reason: z.string().trim().optional(),
})

export type AdjustStockForm = z.infer<typeof adjustStockSchema>

const numberField = (message = 'Ingresá un número') =>
  z
    .string()
    .trim()
    .min(1, 'Este campo es requerido')
    .regex(/^-?\d+(\.\d+)?$/, message)

export const categorySchema = z.object({
  name: nameSchema,
})

export const ingredientSchema = z.object({
  name: nameSchema,
  unit: nameSchema,
})

export const productSchema = z.object({
  name: nameSchema,
  description: nameSchema,
  categoryId: z.string().trim().min(1, 'Seleccioná una categoría'),
  price: numberField('Ingresá un precio válido').refine(
    (value) => Number(value) >= 0,
    'El precio no puede ser negativo',
  ),
  image: z.string().trim().optional(),
})

export const branchSchema = z.object({
  name: nameSchema,
  addressText: nameSchema,
  latitude: numberField('Ingresá una latitud válida').refine(
    (value) => Number(value) >= -90 && Number(value) <= 90,
    'Latitud fuera de rango',
  ),
  longitude: numberField('Ingresá una longitud válida').refine(
    (value) => Number(value) >= -180 && Number(value) <= 180,
    'Longitud fuera de rango',
  ),
  phone: z.string().trim().optional(),
})

export const promotionSchema = z
  .object({
    name: nameSchema,
    description: z.string().trim().optional(),
    startDate: z.string().trim().min(1, 'Ingresá la fecha de inicio'),
    endDate: z.string().trim().min(1, 'Ingresá la fecha de fin'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['endDate'],
  })

const staffBase = {
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  role: z.string().trim().min(1, 'Seleccioná un rol'),
  branchId: z.string().trim().optional(),
}

const requireBranchForCollaborator = (data: { role: string; branchId?: string }) =>
  data.role !== 'branch_admin' || (data.branchId != null && data.branchId.length > 0)

export const staffCreateSchema = z
  .object({
    ...staffBase,
    password: passwordSchema,
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

export const orderStateSchema = z.object({
  name: nameSchema,
  order: numberField('Ingresá un orden válido'),
})

export const configGroupSchema = z.object({
  name: nameSchema,
  type: z.string().trim().min(1, 'Seleccioná un tipo'),
  min: numberField('Ingresá un mínimo válido'),
  max: numberField('Ingresá un máximo válido'),
})

export const configOptionSchema = z.object({
  name: nameSchema,
  priceDelta: numberField('Ingresá una variación válida').refine(
    (value) => Number(value) >= 0,
    'La variación no puede ser negativa',
  ),
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
