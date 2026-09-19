import { loginSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthForm } from '../../../hooks/useAuthForm'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'

export const useLogin = () => {
  const login = useAuthStore((state) => state.login)
  const redirect = useAuthRedirect()

  return useAuthForm({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    errorMessage: 'No pudimos iniciar sesión. Revisá tus datos.',
    submit: async (values) => {
      await login({ email: values.email.trim(), password: values.password })
      redirect(useAuthStore.getState().user?.role)
    },
  })
}
