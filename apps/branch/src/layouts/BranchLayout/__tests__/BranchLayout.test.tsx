import { useState } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import type { Branch, Order } from '@repo/domain'
import { useBranch, useBranchStatus, useIncomingOrder } from '@repo/api'
import { useAudioUnlock } from '@repo/components'
import { renderWithProviders } from '@test/utils'
import { useBranchStatusStore } from '../../../stores/branchStatusStore'
import { BranchLayout } from '../index'

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }))

class FakeAudio {
  preload = ''
  muted = false
  currentTime = 0
  src = ''

  constructor(src?: string) {
    this.src = src ?? ''
  }

  play() {
    return Promise.resolve()
  }
  pause() {}
  load() {}
  removeAttribute() {}
  addEventListener() {}
  removeEventListener() {}
}

vi.stubGlobal('Audio', FakeAudio)

vi.mock('@repo/api', () => ({
  useIncomingOrder: vi.fn(),
  useBranch: vi.fn(),
  useBranchStatus: vi.fn(),
  MOCK_BRANCH_NAME: 'Centro',
}))

vi.mock('@repo/auth', () => ({
  useLogout: () => logout,
}))

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return { ...actual, useAudioUnlock: vi.fn() }
})

const branch: Branch = {
  id: 'b1',
  name: 'Palermo',
  addressText: 'Av. Siempreviva 742',
  latitude: 0,
  longitude: 0,
  phone: null,
  active: true,
  hours: [],
}

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: '101',
  clientId: 'c1',
  branchId: 'b1',
  deliveryAddress: { text: 'Av. Siempreviva 742', latitude: 0, longitude: 0 },
  status: 'PENDING',
  total: 2500,
  estimatedDeliveryAt: null,
  createdAt: '2025-01-01T10:00:00Z',
  statusHistory: [],
  availableTransitions: [],
  client: {
    id: 'c1',
    email: 'ana@b.com',
    role: 'customer',
    firstName: 'Ana',
    lastName: 'Perez',
    phone: '123',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  items: [],
  ...overrides,
})

const renderLayout = () => renderWithProviders(<BranchLayout />)

describe('BranchLayout', () => {
  beforeEach(() => {
    useBranchStatusStore.setState({ isOpen: true })
    vi.mocked(useBranch).mockReturnValue({ branch, isLoading: false })
    vi.mocked(useBranchStatus).mockReturnValue({
      isOpen: true,
      isLoading: false,
      isUpdating: false,
      setOpen: vi.fn(),
      toggle: vi.fn(),
    })
    vi.mocked(useIncomingOrder).mockReturnValue({ incoming: null, acknowledge: vi.fn() })
  })

  it('renders the incoming order modal when there is a new order', async () => {
    vi.mocked(useIncomingOrder).mockReturnValue({
      incoming: makeOrder(),
      acknowledge: vi.fn(),
    })

    renderLayout()

    expect(await screen.findByText('Nuevo pedido #101')).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
  })

  it('acknowledges and hides the modal when closed', async () => {
    const acknowledge = vi.fn()
    vi.mocked(useIncomingOrder).mockImplementation(() => {
      const [incoming, setIncoming] = useState<Order | null>(makeOrder())
      return {
        incoming,
        acknowledge: () => {
          acknowledge()
          setIncoming(null)
        },
      }
    })

    renderLayout()

    await userEvent.click(await screen.findByRole('button', { name: 'Después' }))

    expect(acknowledge).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('Nuevo pedido #101')).not.toBeInTheDocument())
  })

  it('acknowledges and navigates to the order detail from Ver pedido', async () => {
    const acknowledge = vi.fn()
    vi.mocked(useIncomingOrder).mockImplementation(() => {
      const [incoming, setIncoming] = useState<Order | null>(makeOrder())
      return {
        incoming,
        acknowledge: () => {
          acknowledge()
          setIncoming(null)
        },
      }
    })

    renderWithProviders(
      <Routes>
        <Route element={<BranchLayout />}>
          <Route index element={<div>inicio</div>} />
          <Route path="/orders/:orderId" element={<div>detalle del pedido</div>} />
        </Route>
      </Routes>,
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Ver pedido' }))

    expect(acknowledge).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('detalle del pedido')).toBeInTheDocument()
  })

  it('renders the branch name in the header and brand subtitle', () => {
    renderLayout()

    expect(screen.getByText('Sucursal Palermo')).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
  })

  it('falls back to the mock branch name when there is no branch', () => {
    vi.mocked(useBranch).mockReturnValue({ branch: null, isLoading: false })

    renderLayout()

    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
  })

  it('unlocks audio for incoming orders and renders the branch status action', () => {
    renderLayout()

    expect(vi.mocked(useAudioUnlock)).toHaveBeenCalledWith('/incomingOrder.mp3')
    expect(screen.getByRole('button', { name: 'Abierto' })).toBeInTheDocument()
  })

  it('fires logout from the layout', async () => {
    renderLayout()

    await userEvent.click(screen.getAllByText('Salir')[0])

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
