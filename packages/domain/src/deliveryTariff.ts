import { z } from 'zod'

export interface DeliveryTariff {
  id: string
  baseFare: number
  perKm: number
  perOrder: number
  currency: string
  effectiveFrom: string
  active: boolean
  createdBy: string
  createdAt: string
}

const tariffAmount = z
  .string()
  .trim()
  .min(1, 'Este campo es requerido')
  .regex(/^\d+(\.\d+)?$/, 'Ingresá un número mayor o igual a 0')
  .refine((value) => Number(value) >= 0, 'Ingresá un número mayor o igual a 0')

export const deliveryTariffSchema = z.object({
  baseFare: tariffAmount,
  perKm: tariffAmount,
  perOrder: tariffAmount,
})

export type DeliveryTariffForm = z.infer<typeof deliveryTariffSchema>

export const deliveryTariffFormToInput = (form: DeliveryTariffForm) => ({
  baseFare: Number(form.baseFare),
  perKm: Number(form.perKm),
  perOrder: Number(form.perOrder),
  currency: 'ARS',
})
