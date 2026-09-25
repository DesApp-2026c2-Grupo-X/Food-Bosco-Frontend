import { registerFormSchema } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { useAuthConfig, type RegisterRole } from '../../../authConfigContext'
import { AuthSubmitError, useAuthForm } from '../../../hooks/useAuthForm'
import { useAuthRedirect } from '../../../hooks/useAuthRedirect'
import { authErrorMessage, classifyAuthError } from '../../../utils/authErrors'

export const useRegister = () => {
  const register = useAuthStore((state) => state.register)
  const registerRider = useAuthStore((state) => state.registerRider)
  const redirect = useAuthRedirect()
  const config = useAuthConfig()
  const registerDefaultRole = config.registerDefaultRole ?? 'customer'
  const registerRoles = config.registerRoles ?? ['customer', 'rider']
  const genericError = 'No pudimos crear tu cuenta. Revisá los datos e intentá de nuevo.'

  const { form, submitting, error, onSubmit } = useAuthForm({
    schema: registerFormSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirm: '',
      role: registerDefaultRole,
      vehicleType: 'moto',
      brand: '',
      model: '',
      plate: '',
    },
    errorMessage: genericError,
    submit: async (values) => {
      const base = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      }

      try {
        if (values.role === 'rider') {
          const vehicle =
            values.vehicleType === 'bici'
              ? 'Bici'
              : ['Moto', values.brand?.trim(), values.model?.trim(), values.plate?.trim()]
                  .filter(Boolean)
                  .join(' · ')
          await registerRider({ ...base, vehicle })
        } else {
          await register(base)
        }
      } catch (caught) {
        throw new AuthSubmitError(authErrorMessage(classifyAuthError(caught), genericError))
      }

      redirect(values.role as RegisterRole)
    },
  })

  const role = form.watch('role')
  const vehicleType = form.watch('vehicleType')

  return { form, role, vehicleType, submitting, error, onSubmit, registerRoles }
}
