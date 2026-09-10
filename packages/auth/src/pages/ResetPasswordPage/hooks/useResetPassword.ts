import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { z } from 'zod'
import { resetPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const useResetPassword = () => {
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const { token } = useParams<{ token: string }>()
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      setError('Enlace inválido.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await resetPassword(token, values.password)
      setDone(true)
    } catch {
      setError('No pudimos restablecer tu contraseña. El enlace puede haber vencido.')
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submitting, done, error, onSubmit }
}
