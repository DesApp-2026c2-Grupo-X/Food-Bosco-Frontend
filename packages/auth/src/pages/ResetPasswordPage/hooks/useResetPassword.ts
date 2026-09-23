import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resetPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'
import { AUTH_ERROR_MESSAGES, classifyAuthError } from '../../../utils/authErrors'

const GENERIC_ERROR = 'No pudimos restablecer tu contraseña. Intentá de nuevo.'

export const useResetPassword = () => {
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const hasToken = token.length > 0

  const [done, setDone] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  const { form, submitting, error, onSubmit } = useAuthForm({
    schema: resetPasswordSchema,
    defaultValues: { password: '', confirm: '' },
    errorMessage: GENERIC_ERROR,
    submit: async (values) => {
      if (!hasToken) {
        throw new AuthSubmitError('El enlace de recuperación no es válido.')
      }

      try {
        await resetPassword(token, values.password)
      } catch (caught) {
        const kind = classifyAuthError(caught)
        if (kind === 'invalidToken') {
          setInvalidToken(true)
          return
        }

        const message =
          kind === 'throttled' || kind === 'network' ? AUTH_ERROR_MESSAGES[kind] : GENERIC_ERROR
        throw new AuthSubmitError(message)
      }

      setDone(true)
    },
  })

  return { form, submitting, done, invalidToken, hasToken, error, onSubmit }
}
