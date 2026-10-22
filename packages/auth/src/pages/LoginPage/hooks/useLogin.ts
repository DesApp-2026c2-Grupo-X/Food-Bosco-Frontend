import { loginSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthConfig } from '../../../authConfigContext'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)
  const redirect = useAuthRedirect()
  const { app } = useAuthConfig()

  return useAuthForm({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    errorMessage: 'No pudimos iniciar sesión. Revisá tus datos.',
    submit: async (values) => {
      if (!app) {
        throw new AuthSubmitError(
          'No pudimos identificar la aplicación. Recargá la página e intentá de nuevo.',
        )
      }

      await login({ email: values.email.trim(), password: values.password, app })
      redirect(useAuthStore.getState().user?.role)
    },
  })
}
