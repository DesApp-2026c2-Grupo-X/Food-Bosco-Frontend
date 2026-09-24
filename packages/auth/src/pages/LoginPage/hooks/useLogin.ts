import { loginSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'
import { authErrorMessage, classifyAuthError } from '../../../utils/authErrors'

const GENERIC_ERROR = 'No pudimos iniciar sesión. Revisá tus datos.'

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)
  const redirect = useAuthRedirect()

  return useAuthForm({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    errorMessage: GENERIC_ERROR,
    submit: async (values) => {
      try {
        await login({ email: values.email.trim(), password: values.password })
      } catch (caught) {
        throw new AuthSubmitError(authErrorMessage(classifyAuthError(caught), GENERIC_ERROR))
      }
      redirect(useAuthStore.getState().user?.role)
    },
  })
}
