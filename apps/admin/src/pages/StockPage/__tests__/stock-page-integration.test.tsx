import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { StockPage } from '../index'

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av 1',
  latitude: 0,
  longitude: 0,
  phone: null,
  active: true,
  hours: [],
}

const rawStock = {
  ingredientId: 'i1',
  ingredient: { id: 'i1', name: 'Queso', unit: 'kg', active: true },
  branchId: 'b1',
  quantity: 10,
}

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminBranches':
        return { data: { branches: [rawBranch] } }
      case 'AdminBranchStock':
        return { data: { branchStock: [rawStock] } }
      case 'AdjustStock':
        return { data: { adjustStock: rawStock } }
      default:
        return { data: {} }
    }
  })

const renderStock = () => {
  const testClient = makeClient()
  renderWithProviders(<StockPage />, { client: testClient.client })
  return testClient
}

describe('StockPage integration', () => {
  it('loads real branch stock and adjusts through the real hook', async () => {
    const testClient = renderStock()

    expect(await screen.findByText('Queso')).toBeInTheDocument()
    expect(operationVariables(testClient.lastRequest('AdminBranchStock'))).not.toHaveProperty(
      'branchId',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Ajustar' }))
    await userEvent.type(await screen.findByPlaceholderText('Ej: 5 o -3'), '5')
    await userEvent.type(screen.getByPlaceholderText('Conteo físico, reposición…'), 'Conteo')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ajuste' }))

    await waitFor(() =>
      expect(operationVariables(testClient.lastRequest('AdjustStock'))).toEqual({
        input: { branchId: 'b1', ingredientId: 'i1', delta: 5, reason: 'Conteo' },
      }),
    )
    expect(testClient.requestsByName('AdminBranchStock').length).toBeGreaterThan(1)
  })
})
