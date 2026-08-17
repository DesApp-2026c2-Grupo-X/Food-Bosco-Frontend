import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { registerSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'

type RegisterValues = z.infer<typeof registerSchema>

export const useRegister = () => {
  const register = useAuthStore((state) => state.register)
  const redirect = useAuthRedirect()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      })
      redirect('customer')
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submitting, onSubmit }
}
