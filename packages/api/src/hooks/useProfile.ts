import useSWR from "swr"
import type { UpdateProfileInput, User } from "@repo/domain"
import { getJson, patchJson } from "../client/rest"
import { MOCK_USER } from "../mocks/user"

interface UseProfileReturn {
  user: User | undefined
  isLoading: boolean
  updateProfile: (input: UpdateProfileInput) => Promise<void>
}

export const useProfile = (userId?: number): UseProfileReturn => {
  const { data, isLoading } = useSWR<User | null>(
    userId ? `/api/users/${userId}` : null,
    async (url: string) => getJson<User>(url),
  )

  const updateProfile = async (input: UpdateProfileInput) => {
    if (!userId) return
    await patchJson(`/api/users/${userId}`, input)
  }

  return { user: data ?? MOCK_USER, isLoading, updateProfile }
}
