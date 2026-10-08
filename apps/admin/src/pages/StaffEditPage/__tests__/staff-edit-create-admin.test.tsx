import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { StaffEditPage } from '../index'

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: null,
  active: true,
  hours: [],
}

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminUsers':
        return { data: { users: { data: [] } } }
      case 'AdminBranches':
        return { data: { branches: [rawBranch] } }
      case 'CreateAdmin':
        return { data: { createAdmin: { id: 'new-admin' } } }
      default:
        return { data: {} }
    }
  })

describe('StaffEditPage create global admin', () => {
  it('creates a global admin without a branch and returns to the staff list', async () => {
    const client = makeClient()

    renderWithProviders(
      <Routes>
        <Route path="/staff/new" element={<StaffEditPage />} />
        <Route path="/staff" element={<div>Listado de personal</div>} />
      </Routes>,
      { route: '/staff/new', client: client.client },
    )

    await userEvent.type(screen.getByLabelText('Nombre'), 'Andrea')
    await userEvent.type(screen.getByLabelText('Apellido'), 'Ruiz')
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'andrea@foodbosco.com')
    await userEvent.type(screen.getByLabelText('Teléfono'), '11 2222 3333')
    await userEvent.type(screen.getByLabelText('Contraseña inicial'), 'secreto123')
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'super_admin')

    expect(screen.queryByLabelText('Sucursal')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Crear colaborador' }))

    await waitFor(() => expect(client.requestsByName('CreateAdmin')).toHaveLength(1))

    expect(operationVariables(client.lastRequest('CreateAdmin')).input).toEqual({
      firstName: 'Andrea',
      lastName: 'Ruiz',
      email: 'andrea@foodbosco.com',
      phone: '11 2222 3333',
      password: 'secreto123',
    })
    expect(client.requestsByName('CreateStaff')).toHaveLength(0)

    expect(await screen.findByText('Listado de personal')).toBeInTheDocument()
  })
})
