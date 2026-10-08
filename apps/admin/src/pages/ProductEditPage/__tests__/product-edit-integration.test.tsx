import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { ProductEditPage } from '../index'

const rawProduct = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Hamburguesa Clásica',
  description: 'Rica',
  price: 1500,
  image: null,
  available: true,
  configGroups: [
    {
      id: 'g1',
      name: 'Tamaño',
      type: 'SINGLE',
      required: true,
      min: 1,
      max: 1,
      options: [{ id: 'o1', name: 'Doble', extraPrice: 150, available: true }],
    },
  ],
  recipe: [
    {
      id: 'r1',
      ingredientId: 'i1',
      quantity: 2,
      ingredient: { id: 'i1', name: 'Pan', unit: 'un', active: true },
    },
  ],
}

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminProduct':
        return { data: { product: rawProduct } }
      case 'AdminCategories':
        return { data: { categories: [{ id: 'c1', name: 'Hamburguesas', active: true }] } }
      case 'AdminIngredients':
        return { data: { ingredients: [{ id: 'i1', name: 'Pan', unit: 'un', active: true }] } }
      case 'UpdateProduct':
        return { data: { updateProduct: rawProduct } }
      case 'CreateConfigGroup':
        return {
          data: {
            createConfigGroup: {
              id: 'g9',
              name: 'Extras',
              type: 'SINGLE',
              required: false,
              min: 0,
              max: 1,
              options: [],
            },
          },
        }
      case 'AddRecipeItem':
        return { data: { addRecipeItem: rawProduct } }
      default:
        return { data: {} }
    }
  })

const renderEdit = () => {
  const testClient = makeClient()
  renderWithProviders(
    <Routes>
      <Route path="/products/:productId/edit" element={<ProductEditPage />} />
    </Routes>,
    { route: '/products/p1/edit', client: testClient.client },
  )
  return testClient
}

describe('ProductEditPage integration', () => {
  it('loads the product through the real hook', async () => {
    const testClient = renderEdit()

    expect(await screen.findByText('Hamburguesa Clásica')).toBeInTheDocument()
    expect(testClient.lastRequest('AdminProduct')).toBeTruthy()
  })

  it('updates the product and refetches it', async () => {
    const testClient = renderEdit()
    await screen.findByText('Hamburguesa Clásica')

    const name = screen.getByLabelText('Nombre')
    await userEvent.clear(name)
    await userEvent.type(name, 'Hamburguesa XL')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

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
    expect(testClient.requestsByName('AdminProduct').length).toBeGreaterThan(1)
  })

  it('creates a config group and refreshes the product', async () => {
    const testClient = renderEdit()
    await screen.findByText('Hamburguesa Clásica')

    await userEvent.click(screen.getByRole('tab', { name: 'Configuraciones' }))
    await userEvent.click(screen.getByRole('button', { name: 'Nuevo grupo' }))
    const modal = screen.getByRole('dialog')
    await userEvent.type(within(modal).getByLabelText('Nombre'), 'Extras')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('CreateConfigGroup'))).toEqual({
        productId: 'p1',
        input: { name: 'Extras', type: 'SINGLE', required: false, min: 0, max: 1 },
      }),
    )
    expect(testClient.requestsByName('AdminProduct').length).toBeGreaterThan(1)
  })

  it('adds a recipe item through the real hook', async () => {
    const testClient = renderEdit()
    await screen.findByText('Hamburguesa Clásica')

    await userEvent.click(screen.getByRole('tab', { name: 'Receta' }))
    await userEvent.click(screen.getByRole('button', { name: 'Agregar ingrediente' }))
    const modal = screen.getByRole('dialog')
    await userEvent.selectOptions(within(modal).getByLabelText('Ingrediente'), 'i1')
    await userEvent.type(within(modal).getByPlaceholderText('Ej: 1'), '2')
    await userEvent.click(within(modal).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('AddRecipeItem'))).toEqual({
        productId: 'p1',
        input: { ingredientId: 'i1', quantity: 2 },
      }),
    )
    expect(testClient.requestsByName('AdminProduct').length).toBeGreaterThan(1)
  })
})
