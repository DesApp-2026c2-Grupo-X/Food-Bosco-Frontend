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
  street: z.string().trim().min(1, 'Este campo es requerido'),
  city: z.string().trim().min(1, 'Este campo es requerido'),
  reference: z.string().trim(),
})

export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
})
