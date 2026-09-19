import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockClient = vi.hoisted(() => ({
  mutate: vi.fn(),
  query: vi.fn(),
}))

vi.mock('../../client/apollo', () => ({ apolloClient: mockClient }))

import { useAuthStore } from '../authStore'
import {
  LOGIN,
  LOGOUT,
  ME,
  REGISTER,
  REGISTER_RIDER,
  REQUEST_PASSWORD_RECOVERY,
  RESET_PASSWORD,
  UPDATE_PROFILE,
} from '../../client/operations'

const me = {
  id: 'u1',
  email: 'a@b.com',
  role: 'CUSTOMER',
  firstName: 'Ana',
  lastName: 'Perez',
  phone: '123',
  active: true,
  branchId: null,
  vehicle: null,
}

const session = { accessToken: 'acc-1', refreshToken: 'ref-1' }

const resetStore = () =>
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, bypassAuth: false })

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  describe('login', () => {
    it('stores tokens and loads the authenticated user', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { login: session } })
      mockClient.query.mockResolvedValueOnce({ data: { me } })

      await useAuthStore.getState().login({ email: 'a@b.com', password: 'secret' })

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: LOGIN,
        variables: { input: { email: 'a@b.com', password: 'secret' } },
      })
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.objectContaining({ query: ME, fetchPolicy: 'network-only' }),
      )
      expect(useAuthStore.getState()).toMatchObject({
        accessToken: 'acc-1',
        refreshToken: 'ref-1',
        user: { id: 'u1', role: 'customer', firstName: 'Ana' },
      })
    })

    it('rejects an invalid session response without storing tokens', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { login: null } })

      await expect(
        useAuthStore.getState().login({ email: 'a@b.com', password: 'secret' }),
      ).rejects.toThrow('Respuesta de login inválida')

      expect(useAuthStore.getState().accessToken).toBeNull()
      expect(mockClient.query).not.toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('registers a customer and completes the session', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { register: session } })
      mockClient.query.mockResolvedValueOnce({ data: { me } })

      await useAuthStore.getState().register({
        firstName: 'Ana',
        lastName: 'Perez',
        email: 'a@b.com',
        phone: '123',
        password: '12345678',
      })

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: REGISTER,
        variables: {
          input: {
            firstName: 'Ana',
            lastName: 'Perez',
            email: 'a@b.com',
            phone: '123',
            password: '12345678',
          },
        },
      })
      expect(useAuthStore.getState().user?.id).toBe('u1')
    })

    it('registers a rider with a vehicle description', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { registerRider: session } })
      mockClient.query.mockResolvedValueOnce({ data: { me: { ...me, role: 'RIDER' } } })

      await useAuthStore.getState().registerRider({
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'j@b.com',
        phone: '123',
        password: '12345678',
        vehicle: 'Moto · Honda · CG · AB123',
      })

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: REGISTER_RIDER,
        variables: {
          input: {
            firstName: 'Juan',
            lastName: 'Perez',
            email: 'j@b.com',
            phone: '123',
            password: '12345678',
            vehicle: 'Moto · Honda · CG · AB123',
          },
        },
      })
      expect(useAuthStore.getState().user?.role).toBe('rider')
    })
  })

  describe('logout', () => {
    it('clears the session and notifies the API', () => {
      mockClient.mutate.mockResolvedValue({ data: { logout: true } })
      useAuthStore.setState({
        user: { id: 'u1' } as never,
        accessToken: 'acc',
        refreshToken: 'ref',
      })

      useAuthStore.getState().logout()

      expect(mockClient.mutate).toHaveBeenCalledWith({ mutation: LOGOUT })
      expect(useAuthStore.getState()).toMatchObject({
        user: null,
        accessToken: null,
        refreshToken: null,
      })
    })
  })

  describe('updateProfile', () => {
    it('updates the stored user with the API response', async () => {
      mockClient.mutate.mockResolvedValueOnce({
        data: { updateProfile: { ...me, firstName: 'Nueva' } },
      })

      await useAuthStore.getState().updateProfile({
        firstName: 'Nueva',
        lastName: 'Perez',
        phone: '123',
      })

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: UPDATE_PROFILE,
        variables: { input: { firstName: 'Nueva', lastName: 'Perez', phone: '123' } },
      })
      expect(useAuthStore.getState().user?.firstName).toBe('Nueva')
    })

    it('keeps the current user when the API returns nothing', async () => {
      useAuthStore.setState({ user: { id: 'u1', firstName: 'Ana' } as never })
      mockClient.mutate.mockResolvedValueOnce({ data: { updateProfile: null } })

      await useAuthStore.getState().updateProfile({ firstName: 'X', lastName: 'Y', phone: '1' })

      expect(useAuthStore.getState().user?.firstName).toBe('Ana')
    })
  })

  describe('password recovery', () => {
    it('sends the email to request a recovery link', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { requestPasswordRecovery: true } })
      await useAuthStore.getState().forgotPassword('a@b.com')

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: REQUEST_PASSWORD_RECOVERY,
        variables: { email: 'a@b.com' },
      })
    })

    it('sends token and new password to reset', async () => {
      mockClient.mutate.mockResolvedValueOnce({ data: { resetPassword: true } })
      await useAuthStore.getState().resetPassword('token-1', 'new-pass-1')

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: RESET_PASSWORD,
        variables: { token: 'token-1', newPassword: 'new-pass-1' },
      })
    })
  })

  it('exposes token/user helpers used by the app shells', () => {
    useAuthStore.getState().applyTokens('a', 'r')
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'a', refreshToken: 'r' })

    useAuthStore.getState().setBypassAuth(true)
    expect(useAuthStore.getState().bypassAuth).toBe(true)

    useAuthStore.getState().setUser({ id: 'u9' } as never)
    expect(useAuthStore.getState().user?.id).toBe('u9')
  })
})
