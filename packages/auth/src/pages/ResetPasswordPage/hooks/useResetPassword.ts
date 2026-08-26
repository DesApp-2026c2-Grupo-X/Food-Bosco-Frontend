import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { z } from 'zod'
import { resetPasswordSchema } from '@repo/domain'

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const useResetPassword = () => {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const onSubmit = form.handleSubmit(async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    setDone(true)
  })

  return { form, submitting, done, onSubmit }
}
