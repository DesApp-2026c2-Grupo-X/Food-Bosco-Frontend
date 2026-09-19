import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useRiderProfile } from '@repo/api'
import { useVehicleForm } from '../useVehicleForm'
import { useRiderStore } from '../../../../stores/riderStore'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}))

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock

const profile = {
  id: 'r1',
  userId: 'u1',
  firstName: 'Juan',
  lastName: 'Perez',
  phone: '123',
  available: true,
  vehicle: { type: 'moto' as const, brand: 'Honda', model: 'CG', plate: 'AB123' },
  currentLocation: null,
}

const setup = (overrides: { isOnline?: boolean; updateVehicle?: Mock } = {}) => {
  const updateVehicle = overrides.updateVehicle ?? vi.fn().mockResolvedValue(undefined)
  useRiderStore.setState({ isOnline: overrides.isOnline ?? false, location: null })
  profileMock.mockReturnValue({
    profile,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle,
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
  return { updateVehicle }
}

describe('useVehicleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the moto data and navigates to the profile', async () => {
    const { updateVehicle } = setup()
    const { result } = renderHook(() => useVehicleForm())

    await waitFor(() => expect(result.current.form.getValues('brand')).toBe('Honda'))

    await act(async () => {
      await result.current.onSave()
    })

    expect(updateVehicle).toHaveBeenCalledWith({
      type: 'moto',
      brand: 'Honda',
      model: 'CG',
      plate: 'AB123',
    })
    expect(navigate).toHaveBeenCalled()
  })

  it('switching to a bike saves immediately without the moto fields', async () => {
    const { updateVehicle } = setup()
    const { result } = renderHook(() => useVehicleForm())
    await waitFor(() => expect(result.current.type).toBe('moto'))

    await act(async () => {
      await result.current.selectBici()
    })

    expect(updateVehicle).toHaveBeenCalledWith({ type: 'bici' })
    expect(result.current.type).toBe('bici')
  })

  it('blocks vehicle changes while the rider is online', async () => {
    const { updateVehicle } = setup({ isOnline: true })
    const { result } = renderHook(() => useVehicleForm())
    await waitFor(() => expect(result.current.type).toBe('moto'))

    act(() => result.current.selectMoto())
    await act(async () => {
      await result.current.selectBici()
      await result.current.onSave()
    })

    expect(updateVehicle).not.toHaveBeenCalled()
    expect(result.current.type).toBe('moto')
  })

  it('shows an error when saving fails', async () => {
    const { updateVehicle } = setup({ updateVehicle: vi.fn().mockRejectedValue(new Error('x')) })
    const { result } = renderHook(() => useVehicleForm())
    await waitFor(() => expect(result.current.type).toBe('moto'))

    await act(async () => {
      await result.current.onSave()
    })

    expect(result.current.error).toBe('No pudimos guardar tu vehículo. Intentá de nuevo.')
    expect(updateVehicle).toHaveBeenCalled()
  })
})
