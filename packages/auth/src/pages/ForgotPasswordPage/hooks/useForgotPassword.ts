import { useState } from 'react'
import { forgotPasswordSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'
import { AUTH_ERROR_MESSAGES, classifyAuthError } from '../../../utils/authErrors'

const GENERIC_ERROR = 'No pudimos enviar las instrucciones. Intentá de nuevo.'

export const useForgotPassword = () => {
  const forgotPassword = useAuthStore((state) => state.forgotPassword)
  const [sent, setSent] = useState(false)

  const { form, submitting, error, onSubmit } = useAuthForm({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
    errorMessage: GENERIC_ERROR,
    submit: async (values) => {
      try {
        await forgotPassword(values.email.trim())
      } catch (caught) {
        const kind = classifyAuthError(caught)
        const message =
          kind === 'throttled' || kind === 'network' ? AUTH_ERROR_MESSAGES[kind] : GENERIC_ERROR
        throw new AuthSubmitError(message)
      }

      setSent(true)
    },
  })

  return { form, submitting, sent, error, onSubmit }
}
