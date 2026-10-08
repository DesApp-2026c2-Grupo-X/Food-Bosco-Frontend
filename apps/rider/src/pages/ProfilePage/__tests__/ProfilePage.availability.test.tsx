import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useActiveTrip, useAuthStore, useRiderProfile } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ProfilePage } from '../index'
import { useRiderStore } from '../../../stores/riderStore'

const { toggleState, notifyError } = vi.hoisted(() => ({
  toggleState: { promise: null as Promise<void> | null },
  notifyError: vi.fn(),
}))

vi.mock('@repo/auth', () => ({
  useLogout: () => vi.fn(),
}))

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return {
    ...actual,
    notifyError,
    ToggleSwitch: (props: {
      checked: boolean
      onChange: (value: boolean) => Promise<void>
      disabled?: boolean
      ariaLabel?: string
    }) => (
      <button
        type="button"
        aria-label={props.ariaLabel}
        disabled={props.disabled}
        onClick={() => {
          const promise = props.onChange(!props.checked)
          promise.catch(() => undefined)
          toggleState.promise = promise
        }}
      />
    ),
  }
})

vi.mock('@repo/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/api')>()),
  useRiderProfile: vi.fn(),
  useActiveTrip: vi.fn(),
}))

const profileMock = useRiderProfile as unknown as Mock
const tripMock = useActiveTrip as unknown as Mock

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

interface SetupOptions {
  isOnline?: boolean
  trip?: unknown
  setAvailability?: Mock
}

const setup = (options: SetupOptions = {}) => {
  const setAvailability = options.setAvailability ?? vi.fn().mockResolvedValue(undefined)
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'rider@b.com',
      role: 'rider',
      firstName: 'Juan',
      lastName: 'Perez',
      phone: '123',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  useRiderStore.setState({ isOnline: options.isOnline ?? true, location: null })
  profileMock.mockReturnValue({
    profile,
    isLoading: false,
    isMutating: false,
    updateProfile: vi.fn(),
    updateVehicle: vi.fn(),
    setAvailability,
    updateLocation: vi.fn(),
  })
  tripMock.mockReturnValue({
    trip: options.trip ?? null,
    isLoading: false,
    isMutating: false,
    pickup: vi.fn(),
    deliver: vi.fn(),
  })
  return { setAvailability }
}

describe('ProfilePage availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    toggleState.promise = null
  })

  it('rolls back and notifies when the API rejects', async () => {
    const { setAvailability } = setup({
      isOnline: true,
      setAvailability: vi.fn().mockRejectedValue(new Error('boom')),
    })
    renderWithProviders(<ProfilePage />)

    await userEvent.click(screen.getByRole('button', { name: 'Disponibilidad' }))

    expect(setAvailability).toHaveBeenCalledWith(false)
    expect(useRiderStore.getState().isOnline).toBe(true)
    expect(notifyError).toHaveBeenCalledTimes(1)
  })

  it('does not toggle availability while a trip is active', async () => {
    const { setAvailability } = setup({ trip: { id: 't1', status: 'ACTIVE', orders: [] } })
    renderWithProviders(<ProfilePage />)

    const toggle = screen.getByRole('button', { name: 'Disponibilidad' })
    expect(toggle).toBeDisabled()

    await userEvent.click(toggle)

    expect(setAvailability).not.toHaveBeenCalled()
    expect(useRiderStore.getState().isOnline).toBe(true)
  })
})
