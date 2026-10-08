import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { buildReportRange, type ReportFilter } from '@repo/domain'
import { createTestClient, operationVariables, type TestApolloClient } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { ReportsPage } from '../index'

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
      case 'AdminBranches':
        return { data: { branches: [rawBranch] } }
      case 'ReportsOverview':
        return { data: { reportsOverview: {} } }
      case 'BestSellingProducts':
        return { data: { bestSellingProducts: [] } }
      case 'LeastSoldProducts':
        return { data: { leastSoldProducts: [] } }
      case 'OutOfStockProducts':
        return { data: { outOfStockProducts: [] } }
      case 'HighestRevenueProducts':
        return { data: { highestRevenueProducts: [] } }
      default:
        return { data: {} }
    }
  })

const renderPage = async () => {
  const client = makeClient()
  const result = renderWithProviders(<ReportsPage />, { client: client.client })
  await waitFor(() => expect(client.lastRequest('ReportsOverview')).toBeDefined())
  return { client, ...result }
}

const lastFilter = (client: TestApolloClient) =>
  operationVariables(client.lastRequest('ReportsOverview')).filter as ReportFilter

const comboboxes = () => screen.getAllByRole('combobox')

describe('ReportsPage filters', () => {
  it('refetches the overview with the selected branch', async () => {
    const { client } = await renderPage()

    await userEvent.selectOptions(comboboxes()[1], 'b1')

    await waitFor(() => expect(lastFilter(client).branchId).toBe('b1'))
  })

  it('refetches the overview when the date preset changes', async () => {
    const { client } = await renderPage()

    expect(lastFilter(client).groupBy).toBe('MONTH')

    await userEvent.selectOptions(comboboxes()[0], 'day')

    await waitFor(() => expect(lastFilter(client).groupBy).toBe('DAY'))
  })

  it('refetches the overview with the selected status', async () => {
    const { client } = await renderPage()

    await userEvent.selectOptions(comboboxes()[2], 'DELIVERED')

    await waitFor(() => expect(lastFilter(client).status).toBe('DELIVERED'))
  })

  it('sends the custom date range as variables', async () => {
    const { client, container } = await renderPage()

    await userEvent.selectOptions(comboboxes()[0], 'custom')

    const dates = container.querySelectorAll('input[type="date"]')
    fireEvent.change(dates[0], { target: { value: '2025-01-05' } })
    fireEvent.change(dates[1], { target: { value: '2025-01-20' } })

    const expected = buildReportRange('custom', '2025-01-05', '2025-01-20')

    await waitFor(() => expect(lastFilter(client).from).toBe(expected.from.toISOString()))
    expect(lastFilter(client).to).toBe(expected.to.toISOString())
    expect(lastFilter(client).groupBy).toBe('DAY')
  })

  it('combines branch and status filters in the refetch', async () => {
    const { client } = await renderPage()

    await userEvent.selectOptions(comboboxes()[1], 'b1')
    await userEvent.selectOptions(comboboxes()[2], 'DELIVERED')

    await waitFor(() => {
      const filter = lastFilter(client)
      expect(filter.branchId).toBe('b1')
      expect(filter.status).toBe('DELIVERED')
    })
  })
})
