import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBranchStatus } from '@repo/api'
import { notifyError } from '@repo/components'
import { renderWithProviders } from '@test/utils'
import { BranchStatusButton } from '../BranchStatusButton'

vi.mock('@repo/api', () => ({ useBranchStatus: vi.fn() }))

vi.mock('@repo/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/components')>()
  return { ...actual, notifyError: vi.fn() }
})

const mockStatus = (overrides: Partial<ReturnType<typeof useBranchStatus>> = {}) =>
  vi.mocked(useBranchStatus).mockReturnValue({
    isOpen: true,
    isLoading: false,
    isUpdating: false,
    setOpen: vi.fn(),
    toggle: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  })

describe('BranchStatusButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus()
  })

  it('shows Abierto and toggles the branch against the backend on click', async () => {
    const toggle = vi.fn().mockResolvedValue(undefined)
    mockStatus({ toggle })

    renderWithProviders(<BranchStatusButton />)
    expect(screen.getByRole('button', { name: 'Abierto' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Abierto' }))

    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('shows Cerrado when the backend reports the branch as closed', () => {
    mockStatus({ isOpen: false })

    renderWithProviders(<BranchStatusButton />)

    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeInTheDocument()
  })

  it('disables the button while the mutation is in flight', () => {
    mockStatus({ isUpdating: true })

    renderWithProviders(<BranchStatusButton />)

    expect(screen.getByRole('button', { name: 'Abierto' })).toBeDisabled()
  })

  it('notifies an error when the toggle fails', async () => {
    const toggle = vi.fn().mockRejectedValue(new Error('boom'))
    mockStatus({ toggle })

    renderWithProviders(<BranchStatusButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Abierto' }))

    expect(toggle).toHaveBeenCalledTimes(1)
    expect(vi.mocked(notifyError)).toHaveBeenCalledTimes(1)
  })
})
