import { beforeEach, describe, expect, it } from 'vitest'
import { useBranchStatusStore } from '../branchStatusStore'

describe('branchStatusStore', () => {
  beforeEach(() => {
    useBranchStatusStore.setState({ isOpen: true })
  })

  it('toggles the open/closed flag', () => {
    useBranchStatusStore.getState().toggle()
    expect(useBranchStatusStore.getState().isOpen).toBe(false)

    useBranchStatusStore.getState().toggle()
    expect(useBranchStatusStore.getState().isOpen).toBe(true)
  })

  it('sets an explicit value', () => {
    useBranchStatusStore.getState().setOpen(false)
    expect(useBranchStatusStore.getState().isOpen).toBe(false)
  })

  it('persists the state under the branch-status key', () => {
    useBranchStatusStore.getState().setOpen(false)
    const persisted = JSON.parse(localStorage.getItem('branch-status') ?? '{}')
    expect(persisted.state.isOpen).toBe(false)
  })
})
