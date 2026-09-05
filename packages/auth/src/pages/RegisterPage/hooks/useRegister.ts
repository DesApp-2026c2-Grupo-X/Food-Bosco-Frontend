import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { registerFormSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'

type RegisterValues = z.infer<typeof registerFormSchema>

export const useRegister = () => {
  const register = useAuthStore((state) => state.register)
  const registerRider = useAuthStore((state) => state.registerRider)
  const redirect = useAuthRedirect()
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
      role: 'customer',
      vehicle: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const role = form.watch('role')

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
        await registerRider({ ...base, vehicle: values.vehicle?.trim() ?? '' })
      } else {
        await register(base)
      }

      redirect(values.role)
    } finally {
      setSubmitting(false)
    }
  })

  return { form, role, submitting, onSubmit }
}
