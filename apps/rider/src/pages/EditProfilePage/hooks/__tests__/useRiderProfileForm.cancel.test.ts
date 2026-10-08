import { createElement } from 'react'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useAuthStore, useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { RiderProfileForm } from '../../RiderProfileForm'
import { useRiderProfileForm } from '../useRiderProfileForm'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock

const setup = (options: { isLoading?: boolean } = {}) => {
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'r@b.com',
      role: 'rider',
      firstName: 'Juan',
      lastName: 'Perez',
      phone: '123',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  profileMock.mockReturnValue({
    profile: {
      id: 'r1',
      userId: 'u1',
      firstName: 'Juan',
      lastName: 'Perez',
      phone: '5551234',
      available: true,
      vehicle: { type: 'bici' },
      currentLocation: null,
    },
    isLoading: options.isLoading ?? false,
    isMutating: false,
    updateProfile: vi.fn().mockResolvedValue(undefined),
    updateVehicle: vi.fn(),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
}

describe('useRiderProfileForm cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resets the phone to the profile value and clears the dirty state', async () => {
    setup()
    const { result } = renderHook(() => useRiderProfileForm())
    await waitFor(() => expect(result.current.form.getValues('phone')).toBe('5551234'))

    act(() => result.current.form.setValue('phone', '999 9999', { shouldDirty: true }))
    expect(result.current.isDirty).toBe(true)

    act(() => result.current.onCancel())

    expect(result.current.form.getValues('phone')).toBe('5551234')
    expect(result.current.isDirty).toBe(false)
  })

  it('exposes the loading flag so the form can hide', () => {
    setup({ isLoading: true })
    const { result } = renderHook(() => useRiderProfileForm())

    expect(result.current.isLoading).toBe(true)
  })

  it('renders nothing while the profile is loading', () => {
    setup({ isLoading: true })
    renderWithProviders(createElement(RiderProfileForm))

    expect(screen.queryByLabelText('Teléfono')).not.toBeInTheDocument()
  })
})
