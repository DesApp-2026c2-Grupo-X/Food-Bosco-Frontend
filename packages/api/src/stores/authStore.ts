import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LoginInput, RegisterInput, UpdateProfileInput, User } from '@repo/domain'
import { apolloClient } from '../client/apollo'
import {
  LOGIN,
  LOGOUT,
  ME,
  REGISTER,
  REQUEST_PASSWORD_RECOVERY,
  RESET_PASSWORD,
  UPDATE_PROFILE,
  toUser,
  type LoginResult,
  type LogoutResult,
  type MeResult,
  type RegisterResult,
  type RequestPasswordRecoveryResult,
  type ResetPasswordResult,
  type UpdateProfileResult,
} from '../client/operations'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  bypassAuth: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<void>
  setUser: (user: User) => void
  applyTokens: (accessToken: string, refreshToken: string) => void
  setBypassAuth: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      bypassAuth: false,

      login: async (input) => {
        const { data } = await apolloClient.mutate<LoginResult>({
          mutation: LOGIN,
          variables: { input },
        })

        const session = data?.login
        if (!session?.accessToken) {
          throw new Error('Respuesta de login inválida')
        }

        set({ accessToken: session.accessToken, refreshToken: session.refreshToken })

        const { data: meData } = await apolloClient.query<MeResult>({
          query: ME,
          fetchPolicy: 'network-only',
        })

        set({ user: toUser(meData.me) })
      },

      register: async (input) => {
        const { data } = await apolloClient.mutate<RegisterResult>({
          mutation: REGISTER,
          variables: { input },
        })

        const session = data?.register
        if (!session?.accessToken) {
          throw new Error('Respuesta de registro inválida')
        }

        set({ accessToken: session.accessToken, refreshToken: session.refreshToken })

        const { data: meData } = await apolloClient.query<MeResult>({
          query: ME,
          fetchPolicy: 'network-only',
        })

        set({ user: toUser(meData.me) })
      },

      logout: () => {
        void apolloClient.mutate<LogoutResult>({ mutation: LOGOUT }).catch(() => {})
        set({ user: null, accessToken: null, refreshToken: null })
      },

      forgotPassword: async (email) => {
        await apolloClient.mutate<RequestPasswordRecoveryResult>({
          mutation: REQUEST_PASSWORD_RECOVERY,
          variables: { email },
        })
      },

      resetPassword: async (token, newPassword) => {
        await apolloClient.mutate<ResetPasswordResult>({
          mutation: RESET_PASSWORD,
          variables: { token, newPassword },
        })
      },

      updateProfile: async (input) => {
        const { data } = await apolloClient.mutate<UpdateProfileResult>({
          mutation: UPDATE_PROFILE,
          variables: { input },
        })
        if (data?.updateProfile) {
          set({ user: toUser(data.updateProfile) })
        }
      },

      setUser: (user) => set({ user }),

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
