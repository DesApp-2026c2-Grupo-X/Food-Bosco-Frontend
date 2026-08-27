import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useRiderProfile } from '@repo/api'
import { vehicleSchema } from '@repo/domain'
import { routes } from '../../../routes'

type VehicleValues = z.infer<typeof vehicleSchema>

export const useVehicleForm = () => {
  const navigate = useNavigate()
  const { profile, isLoading, updateVehicle } = useRiderProfile()

  const form = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: profile?.vehicle.type ?? 'moto',
      marca: profile?.vehicle.marca ?? '',
      modelo: profile?.vehicle.modelo ?? '',
      patente: profile?.vehicle.patente ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        type: profile.vehicle.type,
        marca: profile.vehicle.marca ?? '',
        modelo: profile.vehicle.modelo ?? '',
        patente: profile.vehicle.patente ?? '',
      })
    }
  }, [profile, form])

  const type = form.watch('type')
  const isDirty = form.formState.isDirty

  const selectMoto = () => {
    form.setValue('type', 'moto', { shouldDirty: false, shouldValidate: false })
  }

  const selectBici = async () => {
    form.reset({ type: 'bici', marca: '', modelo: '', patente: '' })
    await updateVehicle({ type: 'bici' })
  }

  const onSave = form.handleSubmit(async (values) => {
    await updateVehicle(
      values.type === 'moto'
        ? { type: 'moto', marca: values.marca, modelo: values.modelo, patente: values.patente }
        : { type: 'bici' },
    )
    form.reset(values)
    navigate(routes.profile)
  })

  const onCancel = () => {
    if (profile) {
      form.reset({
        type: profile.vehicle.type,
        marca: profile.vehicle.marca ?? '',
        modelo: profile.vehicle.modelo ?? '',
        patente: profile.vehicle.patente ?? '',
      })
    } else {
      form.reset()
    }
  }

  return { isLoading, form, type, isDirty, selectMoto, selectBici, onSave, onCancel }
}
