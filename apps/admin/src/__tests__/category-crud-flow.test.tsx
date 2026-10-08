import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { CategoriesPage } from '../pages/CategoriesPage'

const superAdmin: User = {
  id: 'u1',
  email: 'admin@bosco.test',
  role: 'super_admin',
  firstName: 'Ada',
  lastName: 'Admin',
  phone: '11 5555 1111',
  active: true,
  createdAt: '2025-01-01T10:00:00Z',
}

interface CategoryRow {
  id: string
  name: string
  active: boolean
}

const makeClient = () => {
  const categories: CategoryRow[] = [{ id: 'c1', name: 'Hamburguesas', active: true }]
  let sequence = 1

  return createTestClient((operation) => {
    const variables = operation.variables as Record<string, unknown>

    switch (operation.operationName) {
      case 'AdminCategories':
        return { data: { categories: categories.map((category) => ({ ...category })) } }
      case 'CreateCategory': {
        const input = variables.input as { name: string; active: boolean }
        sequence += 1
        const created = { id: `c${sequence}`, name: input.name, active: input.active }
        categories.push(created)
        return { data: { createCategory: created } }
      }
      case 'UpdateCategory': {
        const id = String(variables.id)
        const input = variables.input as { name: string; active: boolean }
        const index = categories.findIndex((category) => category.id === id)
        if (index >= 0) categories[index] = { ...categories[index], ...input }
        return { data: { updateCategory: categories[index] ?? null } }
      }
      case 'SetCategoryActive': {
        const id = String(variables.id)
        const active = Boolean(variables.active)
        const index = categories.findIndex((category) => category.id === id)
        if (index >= 0) categories[index] = { ...categories[index], active }
        return { data: { setCategoryActive: categories[index] ?? null } }
      }
      default:
        return { data: {} }
    }
  })
}

const renderFlow = (route = '/categories') => {
  const testClient = makeClient()
  renderWithProviders(
    <Routes>
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/new" element={<CategoriesPage />} />
      <Route path="/categories/:categoryId/edit" element={<CategoriesPage />} />
    </Routes>,
    { route, client: testClient.client },
  )
  return testClient
}

describe('category CRUD flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: superAdmin })
  })

  it('creates, toggles, soft-deletes and filters categories end to end', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const testClient = renderFlow()

    expect(await screen.findByText('Hamburguesas')).toBeInTheDocument()
    expect(testClient.lastRequest('AdminCategories')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
    expect(await screen.findByRole('heading', { name: 'Nueva categoría' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Bebidas')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateCategory'))).toEqual({
        input: { name: 'Bebidas', active: true },
      }),
    )

    expect(await screen.findByText('Bebidas')).toBeInTheDocument()
    expect(testClient.requestsByName('AdminCategories').length).toBeGreaterThan(1)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByLabelText('Estado de Hamburguesas'))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('SetCategoryActive'))).toEqual({
        id: 'c1',
        active: false,
      }),
    )
    expect(await screen.findByText('Inactiva')).toBeInTheDocument()

    const search = screen.getByPlaceholderText('Buscar categoría...')
    await user.type(search, 'Bebidas')
    await waitFor(() => expect(screen.queryByText('Hamburguesas')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Eliminar categoría')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('SetCategoryActive'))).toEqual({
        id: 'c2',
        active: false,
      }),
    )
    expect(await screen.findByText('Inactiva')).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'Inexistente')

    expect(await screen.findByText('Sin categorías')).toBeInTheDocument()
  })

  it('edits a category through the /categories/:categoryId/edit route', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const testClient = renderFlow('/categories/c1/edit')

    expect(await screen.findByRole('heading', { name: 'Editar categoría' })).toBeInTheDocument()
    const name = screen.getByLabelText('Nombre')
    expect(name).toHaveValue('Hamburguesas')

    await user.clear(name)
    await user.type(name, 'Bebidas')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('UpdateCategory'))).toEqual({
        id: 'c1',
        input: { name: 'Bebidas', active: true },
      }),
    )
    expect(await screen.findByText('Bebidas')).toBeInTheDocument()
  })
})
