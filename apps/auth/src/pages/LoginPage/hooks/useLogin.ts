import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { loginSchema } from '@repo/domain'
import type { UserRole } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { redirectByRole } from '../../../config'

type LoginValues = z.infer<typeof loginSchema>

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setError(null)
    try {
      await login(values.email.trim())
      redirectByRole(useAuthStore.getState().user?.role)
    } catch {
      setError('No pudimos iniciar sesión. Revisá tus datos.')
    } finally {
      setSubmitting(false)
    }
  })

  const mockLogin = async (role: UserRole) => {
    setError(null)
    await login(`mock-${role}@unahur.edu.ar`, role)
    redirectByRole(role)
  }

  return { form, submitting, error, onSubmit, mockLogin }
}
