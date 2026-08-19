import { useEffect } from 'react'
import { useQuery } from '@apollo/client'
import type { UpdateProfileInput, User } from '@repo/domain'
import { ME, toUser, type MeResult } from '../client/operations'
import { useAuthStore } from '../stores/authStore'

interface UseProfileReturn {
  user: User | null
  isLoading: boolean
  updateProfile: (input: UpdateProfileInput) => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setUser = useAuthStore((state) => state.setUser)
  const updateProfile = useAuthStore((state) => state.updateProfile)

  const { data } = useQuery<MeResult>(ME, {
    skip: !accessToken,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (data?.me) {
      setUser(toUser(data.me))
    }
  }, [data, setUser])

  return { user, isLoading: user == null, updateProfile }
}
