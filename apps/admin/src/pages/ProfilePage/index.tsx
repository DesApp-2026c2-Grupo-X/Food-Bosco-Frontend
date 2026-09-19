import { ProfileView } from '@repo/components'
import { MOCK_SUPER_ADMIN, useAuthStore } from '@repo/api'

export const ProfilePage = () => (
  <ProfileView
    user={useAuthStore((state) => state.user) ?? MOCK_SUPER_ADMIN}
    description="Datos del administrador con sesión iniciada."
  />
)
