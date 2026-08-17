import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LoginInput, RegisterInput, User, UserRole } from '@repo/domain'
import { MOCK_USER } from '../mocks/user'
import { apolloClient } from '../client/apollo'
import { LOGIN, REGISTER, type AuthSession, type AuthUser } from '../client/operations'

const toUser = (authUser: AuthUser): User => ({
  id: Number(authUser.id) || 0,
  email: authUser.email,
  role: authUser.role,
  firstName: authUser.firstName,
  lastName: authUser.lastName,
  phone: authUser.phone ?? '',
  active: true,
  createdAt: new Date().toISOString(),
})

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  bypassAuth: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  mockLogin: (role: UserRole) => Promise<void>
  applyTokens: (accessToken: string, refreshToken: string) => void
  setBypassAuth: (value: boolean) => void
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      bypassAuth: false,

      login: async (input) => {
        const { data } = await apolloClient.mutate<{ login: AuthSession }>({
          mutation: LOGIN,
          variables: { email: input.email, password: input.password },
        })

        const session = data?.login
        if (!session?.accessToken) {
          throw new Error('Respuesta de login inválida')
        }

        set({
          user: toUser(session.user),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        })
      },

      register: async (input) => {
        const { data } = await apolloClient.mutate<{ register: AuthSession }>({
          mutation: REGISTER,
          variables: { input },
        })

        const session = data?.register
        if (!session?.accessToken) {
          return
        }

        set({
          user: toUser(session.user),
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
      },

      mockLogin: async (role) => {
        await delay(600)
        set({ user: { ...MOCK_USER, role }, accessToken: null, refreshToken: null })
      },

      applyTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      setBypassAuth: (value) => set({ bypassAuth: value }),
    }),
    {
      name: 'store-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        bypassAuth: state.bypassAuth,
      }),
    },
  ),
)
