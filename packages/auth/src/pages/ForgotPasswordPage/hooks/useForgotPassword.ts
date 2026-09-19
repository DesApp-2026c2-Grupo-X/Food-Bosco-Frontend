import { useState } from 'react'
import { forgotPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthForm } from '../../../hooks/useAuthForm'

export const useForgotPassword = () => {
  const forgotPassword = useAuthStore((state) => state.forgotPassword)
  const [sent, setSent] = useState(false)

  const { form, submitting, error, onSubmit } = useAuthForm({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
    errorMessage: 'No pudimos enviar las instrucciones. Intentá de nuevo.',
    submit: async (values) => {
      await forgotPassword(values.email.trim())
      setSent(true)
    },
  })

  return { form, submitting, sent, error, onSubmit }
}
