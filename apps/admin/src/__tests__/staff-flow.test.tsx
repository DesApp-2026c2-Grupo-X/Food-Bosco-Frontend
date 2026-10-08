import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup({ pointerEventsCheck: 0 })
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { StaffPage } from '../pages/StaffPage'
import { StaffEditPage } from '../pages/StaffEditPage'

const superAdmin: User = {
  id: 'root',
  email: 'admin@bosco.test',
  role: 'super_admin',
  firstName: 'Ada',
  lastName: 'Admin',
  phone: '11 5555 1111',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

interface RawUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  active: boolean
  branchId: string | null
}

const makeClient = () => {
  const users: RawUser[] = []
  const branches = [
    {
      id: 'b1',
      name: 'Centro',
      addressText: 'Av. Vergara 1200',
      latitude: -34.6,
      longitude: -58.6,
      phone: null,
      active: true,
      hours: [],
    },
  ]
  let sequence = 0

  return createTestClient((operation) => {
    const variables = operation.variables as Record<string, unknown>

    switch (operation.operationName) {
      case 'AdminUsers':
        return { data: { users: { data: users.map((user) => ({ ...user })) } } }
      case 'AdminBranches':
        return { data: { branches } }
      case 'CreateStaff': {
        const input = variables.input as {
          firstName: string
          lastName: string
          email: string
          phone: string
          password: string
          branchId: string
        }
        sequence += 1
        const created: RawUser = {
          id: `u${sequence}`,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          role: 'BRANCH_ADMIN',
          active: true,
          branchId: input.branchId,
        }
        users.push(created)
        return { data: { createStaff: created } }
      }
      case 'CreateAdmin': {
        const input = variables.input as {
          firstName: string
          lastName: string
          email: string
          phone: string
          password: string
        }
        sequence += 1
        const created: RawUser = {
          id: `u${sequence}`,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          role: 'SUPER_ADMIN',
          active: true,
          branchId: null,
        }
        users.push(created)
        return { data: { createAdmin: created } }
      }
      case 'SetUserActive': {
        const index = users.findIndex((user) => user.id === String(variables.id))
        if (index >= 0) users[index] = { ...users[index], active: Boolean(variables.active) }
        return { data: { setUserActive: users[index] ?? null } }
      }
      default:
        return { data: {} }
    }
  })
}

const renderFlow = () => {
  const testClient = makeClient()
  renderWithProviders(
    <Routes>
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/staff/new" element={<StaffEditPage />} />
    </Routes>,
    { route: '/staff', client: testClient.client },
  )
  return testClient
}

describe('staff flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: superAdmin })
  })

  it('creates a branch admin, a global admin and toggles a staff member', async () => {
    const testClient = renderFlow()

    expect(await screen.findByText('Sin personal')).toBeInTheDocument()
    expect(testClient.lastRequest('AdminUsers')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Nuevo colaborador' }))
    expect(await screen.findByRole('heading', { name: 'Nuevo colaborador' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Julián')
    await user.type(screen.getByLabelText('Apellido'), 'Sosa')
    await user.type(screen.getByLabelText('Correo electrónico'), 'julian@foodbosco.com')
    await user.type(screen.getByLabelText('Teléfono'), '11 5555 1234')
    await user.type(screen.getByLabelText('Contraseña inicial'), 'secreto123')
    await user.selectOptions(screen.getByLabelText('Rol'), 'branch_admin')
    await user.selectOptions(screen.getByLabelText('Sucursal'), 'b1')
    await user.click(screen.getByRole('button', { name: 'Crear colaborador' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateStaff'))).toEqual({
        input: {
          firstName: 'Julián',
          lastName: 'Sosa',
          email: 'julian@foodbosco.com',
          phone: '11 5555 1234',
          password: 'secreto123',
          branchId: 'b1',
        },
      }),
    )
    expect(testClient.requestsByName('CreateAdmin')).toHaveLength(0)

    expect(await screen.findByText('Julián Sosa')).toBeInTheDocument()
    expect(screen.getByText('Centro')).toBeInTheDocument()
    expect(screen.getByText('Administrador de sucursal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Nuevo colaborador' }))
    await screen.findByRole('heading', { name: 'Nuevo colaborador' })

    await user.type(screen.getByLabelText('Nombre'), 'Andrea')
    await user.type(screen.getByLabelText('Apellido'), 'Ruiz')
    await user.type(screen.getByLabelText('Correo electrónico'), 'andrea@foodbosco.com')
    await user.type(screen.getByLabelText('Teléfono'), '11 2222 3333')
    await user.type(screen.getByLabelText('Contraseña inicial'), 'secreto123')
    await user.selectOptions(screen.getByLabelText('Rol'), 'super_admin')

    expect(screen.queryByLabelText('Sucursal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Crear colaborador' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateAdmin'))).toEqual({
        input: {
          firstName: 'Andrea',
          lastName: 'Ruiz',
          email: 'andrea@foodbosco.com',
          phone: '11 2222 3333',
          password: 'secreto123',
        },
      }),
    )
    expect(testClient.requestsByName('CreateStaff')).toHaveLength(1)

    expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Estado de Julián Sosa'))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('SetUserActive'))).toEqual({
        id: 'u1',
        active: false,
      }),
    )
    expect(await screen.findByText('Inactivo')).toBeInTheDocument()
  })
})
