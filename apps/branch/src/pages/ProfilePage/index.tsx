import { ProfileView } from '@repo/components'
import { MOCK_BRANCH_ADMIN, useAuthStore } from '@repo/api'

export const ProfilePage = () => (
  <ProfileView
    user={useAuthStore((state) => state.user) ?? MOCK_BRANCH_ADMIN}
    description="Datos del empleado con sesión iniciada."
  />
)
