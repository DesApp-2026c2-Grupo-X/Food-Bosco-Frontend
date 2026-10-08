import { createElement } from 'react'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { VehicleForm } from '../../VehicleForm'
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

const setup = (options: { isLoading?: boolean } = {}) => {
  useRiderStore.setState({ isOnline: false, location: null })
  profileMock.mockReturnValue({
    profile,
    isLoading: options.isLoading ?? false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle: vi.fn().mockResolvedValue(undefined),
    setAvailability: vi.fn(),
    updateLocation: vi.fn(),
  })
}

describe('useVehicleForm edges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('switching back to moto after bici leaves the fields empty and not dirty', async () => {
    setup()
    const { result } = renderHook(() => useVehicleForm())
    await waitFor(() => expect(result.current.type).toBe('moto'))

    await act(async () => {
      await result.current.selectBici()
    })

    expect(result.current.form.getValues()).toEqual({
      type: 'bici',
      brand: '',
      model: '',
      plate: '',
    })

    act(() => result.current.selectMoto())

    expect(result.current.type).toBe('moto')
    expect(result.current.form.getValues()).toEqual({
      type: 'moto',
      brand: '',
      model: '',
      plate: '',
    })
    expect(result.current.isDirty).toBe(false)
  })

  it('onCancel restores the vehicle from the profile', async () => {
    setup()
    const { result } = renderHook(() => useVehicleForm())
    await waitFor(() => expect(result.current.form.getValues('brand')).toBe('Honda'))

    act(() => result.current.form.setValue('brand', 'Yamaha', { shouldDirty: true }))
    expect(result.current.form.getValues('brand')).toBe('Yamaha')

    act(() => result.current.onCancel())

    expect(result.current.form.getValues()).toEqual({
      type: 'moto',
      brand: 'Honda',
      model: 'CG',
      plate: 'AB123',
    })
    expect(result.current.isDirty).toBe(false)
  })

  it('exposes the loading flag so the form can hide', () => {
    setup({ isLoading: true })
    const { result } = renderHook(() => useVehicleForm())

    expect(result.current.isLoading).toBe(true)
  })

  it('renders nothing while the profile is loading', () => {
    setup({ isLoading: true })
    renderWithProviders(createElement(VehicleForm))

    expect(screen.queryByRole('button', { name: 'Moto' })).not.toBeInTheDocument()
  })
})
