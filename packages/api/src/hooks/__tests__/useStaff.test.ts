import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStaff } from '../useStaff'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderHookWithProviders } from '@test/utils'

const rawStaff = {
  id: 'u1',
  firstName: 'Ana',
  lastName: 'Perez',
  email: 'ana@b.com',
  phone: '1',
  role: 'BRANCH_ADMIN',
  active: true,
  branchId: 'b1',
}

const rawCustomer = {
  id: 'u2',
  firstName: 'Cli',
  lastName: 'Ente',
  email: 'c@b.com',
  phone: '2',
  role: 'CUSTOMER',
  active: true,
  branchId: null,
}

const setup = () => {
  const testClient = createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminUsers':
        return { data: { users: { data: [rawStaff, rawCustomer] } } }
      case 'AdminBranches':
        return { data: { branches: [{ id: 'b1', name: 'Centro' }] } }
      default:
        return { data: {} }
    }
  })
  const rendered = renderHookWithProviders(() => useStaff(), { client: testClient.client })
  return { testClient, ...rendered }
}

describe('useStaff', () => {
  it('keeps only staff members and resolves branch names', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.staff.map((m) => m.id)).toEqual(['u1'])
    expect(result.current.staff[0]?.role).toBe('branch_admin')
    expect(result.current.staff[0]?.branchName).toBe('Centro')
  })

  it('creates a branch admin through createStaff including the branch', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create({
        firstName: 'Ana',
        lastName: 'Perez',
        email: 'ana@b.com',
        phone: '1',
        password: '12345678',
        role: 'branch_admin',
        branchId: 'b1',
      })
    })

    expect(operationVariables(testClient.lastRequest('CreateStaff'))).toEqual({
      input: {
        firstName: 'Ana',
        lastName: 'Perez',
        email: 'ana@b.com',
        phone: '1',
        password: '12345678',
        branchId: 'b1',
      },
    })
    expect(testClient.requestsByName('CreateAdmin')).toHaveLength(0)
    expect(testClient.requestsByName('AdminUsers').length).toBeGreaterThan(1)
  })

  it('creates a super admin without a branch', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.create({
        firstName: 'Root',
        lastName: 'Admin',
        email: 'root@b.com',
        phone: '1',
        password: '12345678',
        role: 'super_admin',
      })
    })

    expect(testClient.requestsByName('CreateStaff')).toHaveLength(0)
    expect(operationVariables(testClient.lastRequest('CreateAdmin'))?.input).toEqual({
      firstName: 'Root',
      lastName: 'Admin',
      email: 'root@b.com',
      phone: '1',
      password: '12345678',
    })
  })

  it('updates staff and normalizes an absent branch to null', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.update('u1', {
        firstName: 'Ana',
        lastName: 'Perez',
        phone: '999',
        role: 'branch_admin',
      })
    })

    expect(operationVariables(testClient.lastRequest('UpdateUser'))).toEqual({
      id: 'u1',
      input: { firstName: 'Ana', lastName: 'Perez', phone: '999', branchId: null },
    })
  })

  it('toggles the active flag', async () => {
    const { testClient, result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.toggle('u1', false)
    })

    expect(operationVariables(testClient.lastRequest('SetUserActive'))).toEqual({
      id: 'u1',
      active: false,
    })
  })
})
