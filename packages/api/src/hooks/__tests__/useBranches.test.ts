import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { BranchHoursInput, BranchInput } from '@repo/domain'
import { useBranches } from '../useBranches'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawBranch = {
  id: 'b1',
  name: 'Sucursal Centro',
  addressText: 'Calle 1',
  latitude: -34.6,
  longitude: -58.4,
  phone: '123',
  active: true,
  hours: [{ dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false }],
}

const branchInput: BranchInput = {
  name: 'Sucursal Nueva',
  addressText: 'Calle 2',
  latitude: -34.7,
  longitude: -58.5,
  active: true,
}

const setup = (createBranch: unknown = rawBranch) => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminBranches':
        return { data: { branches: [rawBranch] } }
      case 'CreateBranch':
        return { data: { createBranch } }
      case 'UpdateBranch':
        return { data: { updateBranch: rawBranch } }
      case 'SetBranchActive':
        return { data: { setBranchActive: rawBranch } }
      case 'UpdateBranchHours':
        return { data: { updateBranchHours: [] } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useBranches(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useBranches', () => {
  it('loads and maps the branches', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.branches).toEqual([
      {
        id: 'b1',
        name: 'Sucursal Centro',
        addressText: 'Calle 1',
        latitude: -34.6,
        longitude: -58.4,
        phone: '123',
        active: true,
        hours: [{ dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false }],
      },
    ])
  })

  it('create returns the new branch id and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let created: string | null = null
    await act(async () => {
      created = await result.current.create(branchInput)
    })

    expect(operationVariables(testClient.lastRequest('CreateBranch'))).toEqual({
      input: branchInput,
    })
    expect(created).toBe('b1')
    expect(testClient.requestsByName('AdminBranches').length).toBeGreaterThan(1)
  })

  it('create returns null when the backend sends no branch', async () => {
    const { result } = setup(null)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let created: string | null = 'x'
    await act(async () => {
      created = await result.current.create(branchInput)
    })

    expect(created).toBeNull()
  })

  it('update sends id + input and refetches', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update('b1', branchInput)
    })

    expect(operationVariables(testClient.lastRequest('UpdateBranch'))).toEqual({
      id: 'b1',
      input: branchInput,
    })
    expect(testClient.requestsByName('AdminBranches').length).toBeGreaterThan(1)
  })

  it('toggle sends id + active', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggle('b1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetBranchActive'))).toEqual({
      id: 'b1',
      active: false,
    })
  })

  it('saveHours renames id to branchId and nulls closed opening/closing', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const hours: BranchHoursInput[] = [
      { dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false },
      { dayOfWeek: 0, opening: '10:00', closing: '14:00', closed: true },
    ]

    await act(async () => {
      await result.current.saveHours('b1', hours)
    })

    expect(operationVariables(testClient.lastRequest('UpdateBranchHours'))).toEqual({
      branchId: 'b1',
      hours: [
        { dayOfWeek: 1, opening: '09:00', closing: '18:00', closed: false },
        { dayOfWeek: 0, opening: null, closing: null, closed: true },
      ],
    })
    expect(testClient.requestsByName('AdminBranches').length).toBeGreaterThan(1)
  })
})
