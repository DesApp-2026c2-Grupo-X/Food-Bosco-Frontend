import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useRiderProfile } from '@repo/api'
import { vehicleSchema } from '@repo/domain'
import { routes } from '../../../routes'
import { useRiderStore } from '../../../stores/riderStore'

type VehicleValues = z.infer<typeof vehicleSchema>

export const useVehicleForm = () => {
  const navigate = useNavigate()
  const isOnline = useRiderStore((state) => state.isOnline)
  const { profile, isLoading, updateVehicle } = useRiderProfile()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: profile?.vehicle.type ?? 'moto',
      brand: profile?.vehicle.brand ?? '',
      model: profile?.vehicle.model ?? '',
      plate: profile?.vehicle.plate ?? '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        type: profile.vehicle.type,
        brand: profile.vehicle.brand ?? '',
        model: profile.vehicle.model ?? '',
        plate: profile.vehicle.plate ?? '',
      })
    }
  }, [profile, form])

  const type = form.watch('type')
  const isDirty = form.formState.isDirty

  const selectMoto = () => {
    if (isOnline) return
    form.setValue('type', 'moto', { shouldDirty: false, shouldValidate: false })
  }

  const selectBici = async () => {
    if (isOnline) return
    setError(null)
    form.reset({ type: 'bici', brand: '', model: '', plate: '' })
    try {
      await updateVehicle({ type: 'bici' })
    } catch {
      setError('No pudimos guardar tu vehículo. Intentá de nuevo.')
    }
  }

  const onSave = form.handleSubmit(async (values) => {
    if (isOnline) return
    setSubmitting(true)
    setError(null)
    try {
      await updateVehicle(
        values.type === 'moto'
          ? { type: 'moto', brand: values.brand, model: values.model, plate: values.plate }
          : { type: 'bici' },
      )
      form.reset(values)
      navigate(routes.profile)
    } catch {
      setError('No pudimos guardar tu vehículo. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  })

  const onCancel = () => {
    if (profile) {
      form.reset({
        type: profile.vehicle.type,
        brand: profile.vehicle.brand ?? '',
        model: profile.vehicle.model ?? '',
        plate: profile.vehicle.plate ?? '',
      })
    } else {
      form.reset()
    }
  }

  return {
    isLoading,
    form,
    type,
    isDirty,
    submitting,
    error,
    selectMoto,
    selectBici,
    onSave,
    onCancel,
  }
}
