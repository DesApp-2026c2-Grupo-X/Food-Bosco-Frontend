import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { forgotPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const useForgotPassword = () => {
  const forgotPassword = useAuthStore((state) => state.forgotPassword)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await forgotPassword(values.email.trim())
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  })

  return { form, submitting, sent, onSubmit }
}
