import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const user = userEvent.setup({ pointerEventsCheck: 0 })
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { User } from '@repo/domain'
import { useAuthStore } from '@repo/api'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductEditPage } from '../pages/ProductEditPage'

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

interface RawOption {
  id: string
  name: string
  extraPrice: number
  available: boolean
}

interface RawGroup {
  id: string
  name: string
  type: string
  required: boolean
  min: number | null
  max: number | null
  options: RawOption[]
}

interface RawRecipeItem {
  id: string
  ingredientId: string
  quantity: number
}

interface RawProduct {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string | null
  available: boolean
  configGroups: RawGroup[]
  recipe: RawRecipeItem[]
}

const makeClient = () => {
  const product: RawProduct = {
    id: 'p1',
    categoryId: 'c1',
    name: 'Hamburguesa Clásica',
    description: 'Rica',
    price: 1500,
    image: null,
    available: true,
    configGroups: [],
    recipe: [],
  }
  const categories = [{ id: 'c1', name: 'Hamburguesas', active: true }]
  const ingredients = [{ id: 'i1', name: 'Pan', unit: 'un', active: true }]
  let groupSequence = 0
  let optionSequence = 0
  let recipeSequence = 0

  return createTestClient((operation) => {
    const variables = operation.variables as Record<string, unknown>

    switch (operation.operationName) {
      case 'AdminProducts':
        return { data: { products: [{ ...product, category: categories[0] }] } }
      case 'AdminProduct':
        return { data: { product: variables.id === 'p1' ? { ...product } : null } }
      case 'AdminCategories':
        return { data: { categories } }
      case 'AdminIngredients':
        return { data: { ingredients } }
      case 'UpdateProduct': {
        const input = variables.input as {
          name: string
          description: string
          categoryId: string
          price: number
          image: string | null
          available: boolean
        }
        product.name = input.name
        product.description = input.description
        product.categoryId = input.categoryId
        product.price = input.price
        product.image = input.image
        product.available = input.available
        return { data: { updateProduct: { ...product } } }
      }
      case 'SetProductAvailable':
        product.available = Boolean(variables.available)
        return { data: { setProductAvailable: { ...product, category: categories[0] } } }
      case 'CreateConfigGroup': {
        const input = variables.input as {
          name: string
          type: string
          required: boolean
          min: number
          max: number
        }
        groupSequence += 1
        const group: RawGroup = {
          id: `g${groupSequence}`,
          name: input.name,
          type: input.type,
          required: input.required,
          min: input.min,
          max: input.max,
          options: [],
        }
        product.configGroups.push(group)
        return { data: { createConfigGroup: { ...group, options: [] } } }
      }
      case 'CreateConfigOption': {
        const input = variables.input as { name: string; extraPrice: number; available: boolean }
        optionSequence += 1
        const option: RawOption = { id: `o${optionSequence}`, ...input }
        const group = product.configGroups.find((entry) => entry.id === variables.groupId)
        group?.options.push(option)
        return { data: { createConfigOption: option } }
      }
      case 'AddRecipeItem': {
        const input = variables.input as { ingredientId: string; quantity: number }
        recipeSequence += 1
        product.recipe.push({ id: `r${recipeSequence}`, ...input })
        return { data: { addRecipeItem: { ...product } } }
      }
      default:
        return { data: {} }
    }
  })
}

const renderFlow = (route: string) => {
  const testClient = makeClient()
  renderWithProviders(
    <Routes>
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId/edit" element={<ProductEditPage />} />
    </Routes>,
    { route, client: testClient.client },
  )
  return testClient
}

describe('product editor flow', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: superAdmin })
  })

  it('edits the product, configs, recipe and availability end to end', async () => {
    const testClient = renderFlow('/products')

    expect(await screen.findByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(testClient.lastRequest('AdminProducts')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(await screen.findByRole('heading', { name: 'Hamburguesa Clásica' })).toBeInTheDocument()
    expect(testClient.lastRequest('AdminProduct')).toBeTruthy()

    const dataPanel = screen.getByRole('tabpanel')
    const name = within(dataPanel).getByLabelText('Nombre')
    await user.clear(name)
    await user.type(name, 'Hamburguesa XL')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('UpdateProduct'))).toEqual({
        id: 'p1',
        input: expect.objectContaining({
          name: 'Hamburguesa XL',
          categoryId: 'c1',
          price: 1500,
          available: true,
          image: null,
        }),
      }),
    )
    expect(await screen.findByRole('heading', { name: 'Hamburguesa XL' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Configuraciones' }))
    await user.click(screen.getByRole('button', { name: 'Nuevo grupo' }))
    const groupModal = await screen.findByRole('dialog')
    await user.type(within(groupModal).getByLabelText('Nombre'), 'Extras')
    await user.click(within(groupModal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateConfigGroup'))).toEqual({
        productId: 'p1',
        input: { name: 'Extras', type: 'SINGLE', required: false, min: 0, max: 1 },
      }),
    )
    expect(await screen.findByText('Extras')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Agregar opción/ }))
    const optionModal = await screen.findByRole('dialog')
    await user.type(within(optionModal).getByLabelText('Nombre'), 'Queso')
    await user.type(within(optionModal).getByLabelText('Variación de precio'), '100')
    await user.click(within(optionModal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateConfigOption'))).toEqual({
        productId: 'p1',
        groupId: 'g1',
        input: { name: 'Queso', extraPrice: 100, available: true },
      }),
    )
    expect(await screen.findByText('Queso')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Receta' }))
    await user.click(screen.getByRole('button', { name: 'Agregar ingrediente' }))
    const recipeModal = await screen.findByRole('dialog')
    await user.selectOptions(within(recipeModal).getByLabelText('Ingrediente'), 'i1')
    await user.type(within(recipeModal).getByLabelText('Cantidad'), '2')
    await user.click(within(recipeModal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('AddRecipeItem'))).toEqual({
        productId: 'p1',
        input: { ingredientId: 'i1', quantity: 2 },
      }),
    )
    await waitFor(() => expect(screen.queryByText('Sin ingredientes')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volver' }))

    expect(await screen.findByText('Hamburguesa XL')).toBeInTheDocument()
    const availability = screen.getByLabelText('Disponibilidad de Hamburguesa XL')
    expect(availability).toHaveAttribute('data-state', 'checked')
    await user.click(availability)

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('SetProductAvailable'))).toEqual({
        id: 'p1',
        available: false,
      }),
    )
    await waitFor(() =>
      expect(screen.getByLabelText('Disponibilidad de Hamburguesa XL')).toHaveAttribute(
        'data-state',
        'unchecked',
      ),
    )
  })

  it('shows the not-found state for a missing product', async () => {
    const testClient = renderFlow('/products/missing/edit')

    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
    expect(testClient.lastRequest('AdminProduct')).toBeTruthy()
  })
})
