import type { ReactNode } from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserRole } from '@repo/domain'
import { AuthProvider, type AuthAppConfig } from '../index'
import { useAuthForm, AuthSubmitError } from '../hooks/useAuthForm'
import { useAuthRedirect } from '../hooks/useAuthRedirect'
import { useLogout } from '../hooks/useLogout'
import { useLogin } from '../pages/LoginPage/hooks/useLogin'
import { useRegister } from '../pages/RegisterPage/hooks/useRegister'
import { useAuthStore } from '@repo/api'
import { loginSchema } from '@repo/domain'

const mockAuthState = {
  login: vi.fn(),
  register: vi.fn(),
  registerRider: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  user: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ ...mockAuthState })
})

const wrapper =
  (config: AuthAppConfig = {}, initialPath = '/login') =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider {...config}>{children}</AuthProvider>
    </MemoryRouter>
  )

describe('useAuthForm', () => {
  const renderForm = (submit: (values: { email: string; password: string }) => Promise<void>) =>
    renderHook(
      () =>
        useAuthForm({
          schema: loginSchema,
          defaultValues: { email: '', password: '' },
          submit,
          errorMessage: 'generic error',
        }),
      { wrapper: wrapper() },
    )

  it('submits valid values and resets the submitting flag', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    const { result } = renderForm(submit)

    act(() => {
      result.current.form.setValue('email', 'a@b.com')
      result.current.form.setValue('password', 'secret')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(submit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
    expect(result.current.submitting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('does not submit invalid values', async () => {
    const submit = vi.fn()
    const { result } = renderForm(submit)

    act(() => {
      result.current.form.setValue('email', 'not-an-email')
      result.current.form.setValue('password', 'secret')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(submit).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('surfaces AuthSubmitError messages and falls back to the generic message', async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new AuthSubmitError('custom message'))
      .mockRejectedValueOnce(new Error('unexpected'))
    const { result } = renderForm(submit)

    act(() => {
      result.current.form.setValue('email', 'a@b.com')
      result.current.form.setValue('password', 'secret')
    })

    await act(async () => {
      await result.current.onSubmit()
    })
    expect(result.current.error).toBe('custom message')

    await act(async () => {
      await result.current.onSubmit()
    })
    expect(result.current.error).toBe('generic error')
  })
})

describe('useLogin', () => {
  it('trims the email before calling the store and redirects', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ login, user: { role: 'customer' } as never })

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper({ defaultPath: '/home' }) })

    act(() => {
      result.current.form.setValue('email', '  a@b.com  ')
      result.current.form.setValue('password', 'secret')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
  })

  it('maps a store failure to the friendly message', async () => {
    const login = vi.fn().mockRejectedValue(new Error('401'))
    useAuthStore.setState({ login })

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() })

    act(() => {
      result.current.form.setValue('email', 'a@b.com')
      result.current.form.setValue('password', 'secret')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(result.current.error).toBe('No pudimos iniciar sesión. Revisá tus datos.')
  })
})

describe('useRegister', () => {
  const setValidBase = (form: ReturnType<typeof useRegister>['form']) => {
    form.setValue('firstName', ' Ana ')
    form.setValue('lastName', ' Perez ')
    form.setValue('email', ' a@b.com ')
    form.setValue('phone', ' +54 11 5555-1234 ')
    form.setValue('password', '12345678')
    form.setValue('confirm', '12345678')
  }

  it('registers a customer with trimmed values', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ register })

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper({}, '/register') })

    act(() => {
      result.current.form.setValue('role', 'customer')
      setValidBase(result.current.form)
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(register).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Perez',
      email: 'a@b.com',
      phone: '+54 11 5555-1234',
      password: '12345678',
    })
    expect(useAuthStore.getState().registerRider).not.toHaveBeenCalled()
  })

  it('registers a moto rider with the composed vehicle description', async () => {
    const registerRider = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ registerRider })

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper({}, '/register') })

    act(() => {
      result.current.form.setValue('role', 'rider')
      result.current.form.setValue('vehicleType', 'moto')
      result.current.form.setValue('brand', 'Honda')
      result.current.form.setValue('model', 'CG 125')
      result.current.form.setValue('plate', 'AB 123 CD')
      setValidBase(result.current.form)
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(registerRider).toHaveBeenCalledWith(
      expect.objectContaining({ vehicle: 'Moto · Honda · CG 125 · AB 123 CD' }),
    )
  })

  it('registers a bike rider with the "Bici" description', async () => {
    const registerRider = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ registerRider })

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper({}, '/register') })

    act(() => {
      result.current.form.setValue('role', 'rider')
      result.current.form.setValue('vehicleType', 'bici')
      setValidBase(result.current.form)
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(registerRider).toHaveBeenCalledWith(expect.objectContaining({ vehicle: 'Bici' }))
  })

  it('blocks a moto rider without vehicle data', async () => {
    const registerRider = vi.fn()
    useAuthStore.setState({ registerRider })

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper({}, '/register') })

    act(() => {
      result.current.form.setValue('role', 'rider')
      result.current.form.setValue('vehicleType', 'moto')
      setValidBase(result.current.form)
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    expect(registerRider).not.toHaveBeenCalled()
    expect(result.current.role).toBe('rider')
  })

  it('reacts to role and vehicle type changes', () => {
    const { result } = renderHook(() => useRegister(), { wrapper: wrapper({}, '/register') })
    expect(result.current.role).toBe('customer')

    act(() => result.current.form.setValue('role', 'rider'))
    expect(result.current.role).toBe('rider')

    act(() => result.current.form.setValue('vehicleType', 'bici'))
    expect(result.current.vehicleType).toBe('bici')
  })
})

const PathProbe = () => {
  const { pathname } = useLocation()
  return <span data-testid="path">{pathname}</span>
}

const RedirectHarness = ({ role }: { role?: UserRole }) => {
  const redirect = useAuthRedirect()
  return (
    <>
      <button type="button" onClick={() => redirect(role)}>
        go
      </button>
      <PathProbe />
    </>
  )
}

const renderRedirectHarness = (config: AuthAppConfig, role?: UserRole) =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider {...config}>
        <Routes>
          <Route path="*" element={<RedirectHarness role={role} />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('useAuthRedirect', () => {
  it('delegates to a custom redirectByRole callback', () => {
    const redirectByRole = vi.fn()
    const { result } = renderHook(() => useAuthRedirect(), {
      wrapper: wrapper({ redirectByRole }),
    })

    act(() => result.current('branch_admin'))
    expect(redirectByRole).toHaveBeenCalledWith('branch_admin')
  })

  it('navigates to the configured default path for customers', async () => {
    renderRedirectHarness({ defaultPath: '/home' }, 'customer')
    expect(screen.getByTestId('path')).toHaveTextContent('/login')

    await userEvent.click(screen.getByRole('button', { name: 'go' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/home')
  })

  it('uses the root path when no default is configured', async () => {
    renderRedirectHarness({}, undefined)
    await userEvent.click(screen.getByRole('button', { name: 'go' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })
})

describe('useLogout', () => {
  it('clears the session and navigates to login', () => {
    const logout = vi.fn()
    useAuthStore.setState({ logout })

    const { result } = renderHook(() => useLogout(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['/profile']}>{children}</MemoryRouter>
      ),
    })

    act(() => result.current())
    expect(logout).toHaveBeenCalled()
  })
})
