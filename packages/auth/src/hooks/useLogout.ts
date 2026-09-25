import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@repo/api'
import { authRoutes } from '../routes'

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return useCallback(() => {
    logout()
    navigate(authRoutes.login, { replace: true })
  }, [logout, navigate])
}
