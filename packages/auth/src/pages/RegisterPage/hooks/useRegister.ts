import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { registerFormSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthConfig } from '../../../authConfigContext'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'
import type { RegisterRole } from '../../../authConfigContext'

type RegisterValues = z.infer<typeof registerFormSchema>

export const useRegister = () => {
  const register = useAuthStore((state) => state.register)
  const registerRider = useAuthStore((state) => state.registerRider)
  const redirect = useAuthRedirect()
  const config = useAuthConfig()
  const registerDefaultRole = config.registerDefaultRole ?? 'customer'
  const registerRoles = config.registerRoles ?? ['customer', 'rider']
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
      role: registerDefaultRole,
      vehicleType: 'moto',
      marca: '',
      modelo: '',
      patente: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const role = form.watch('role')
  const vehicleType = form.watch('vehicleType')

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const base = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      }

      if (values.role === 'rider') {
        const vehicle =
          values.vehicleType === 'bici'
            ? 'Bici'
            : ['Moto', values.marca?.trim(), values.modelo?.trim(), values.patente?.trim()]
                .filter(Boolean)
                .join(' · ')
        await registerRider({ ...base, vehicle })
      } else {
        await register(base)
      }

      redirect(values.role as RegisterRole)
    } finally {
      setSubmitting(false)
    }
  })

  return { form, role, vehicleType, submitting, onSubmit, registerRoles }
}
