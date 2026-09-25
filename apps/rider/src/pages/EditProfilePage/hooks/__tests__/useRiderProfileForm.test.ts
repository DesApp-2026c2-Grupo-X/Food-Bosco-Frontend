import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useAuthStore, useRiderProfile } from '@repo/api'
import { useRiderProfileForm } from '../useRiderProfileForm'

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock

const setup = (updateProfile: Mock = vi.fn().mockResolvedValue(undefined)) => {
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
    isLoading: false,
    isMutating: false,
    updateProfile,
    updateVehicle: vi.fn(),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
  return { updateProfile }
}

describe('useRiderProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefills the phone from the rider profile', async () => {
    setup()
    const { result } = renderHook(() => useRiderProfileForm())
    await waitFor(() => expect(result.current.form.getValues('phone')).toBe('5551234'))
  })

  it('saves the trimmed phone and clears errors', async () => {
    const { updateProfile } = setup()
    const { result } = renderHook(() => useRiderProfileForm())
    await waitFor(() => expect(result.current.form.getValues('phone')).toBe('5551234'))

    act(() => result.current.form.setValue('phone', '  999 1234  '))

    await act(async () => {
      await result.current.onSave()
    })

    expect(updateProfile).toHaveBeenCalledWith({ phone: '999 1234' })
    expect(result.current.error).toBeNull()
  })

  it('surfaces a friendly error when saving fails', async () => {
    setup(vi.fn().mockRejectedValue(new Error('boom')))
    const { result } = renderHook(() => useRiderProfileForm())
    await waitFor(() => expect(result.current.form.getValues('phone')).toBe('5551234'))

    await act(async () => {
      await result.current.onSave()
    })

    expect(result.current.error).toBe('No pudimos guardar tus datos. Intentá de nuevo.')
  })
})
