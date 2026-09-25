import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BranchStatusButton } from '../BranchStatusButton'
import { useBranchStatusStore } from '../../stores/branchStatusStore'
import { renderWithProviders } from '@test/utils'

describe('BranchStatusButton', () => {
  beforeEach(() => {
    useBranchStatusStore.setState({ isOpen: true })
  })

  it('reflects the store state and toggles it on click', async () => {
    renderWithProviders(<BranchStatusButton />)
    expect(screen.getByRole('button', { name: 'Abierto' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Abierto' }))

    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeInTheDocument()
    expect(useBranchStatusStore.getState().isOpen).toBe(false)
  })

  it('starts closed when the persisted state is closed', () => {
    useBranchStatusStore.setState({ isOpen: false })
    renderWithProviders(<BranchStatusButton />)
    expect(screen.getByRole('button', { name: 'Cerrado' })).toBeInTheDocument()
  })
})
