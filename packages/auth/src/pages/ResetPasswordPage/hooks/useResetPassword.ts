import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { resetPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'

export const useResetPassword = () => {
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const { token } = useParams<{ token: string }>()
  const [done, setDone] = useState(false)

  const { form, submitting, error, onSubmit } = useAuthForm({
    schema: resetPasswordSchema,
    defaultValues: { password: '', confirm: '' },
    errorMessage: 'No pudimos restablecer tu contraseña. El enlace puede haber vencido.',
    submit: async (values) => {
      if (!token) {
        throw new AuthSubmitError('Enlace inválido.')
      }

      await resetPassword(token, values.password)
      setDone(true)
    },
  })

  return { form, submitting, done, error, onSubmit }
}
