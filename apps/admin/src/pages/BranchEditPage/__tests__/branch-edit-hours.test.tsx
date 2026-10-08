import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createTestClient, operationVariables } from '@test/apollo'
import { renderWithProviders } from '@test/utils'
import { BranchEditPage } from '../index'

vi.mock('@repo/api', async () => {
  const actual = await vi.importActual<typeof import('@repo/api')>('@repo/api')
  return { ...actual, buildLeafletTileUrl: () => null }
})

const rawBranch = {
  id: 'b1',
  name: 'Centro',
  addressText: 'Av. Vergara 1200',
  latitude: -34.6,
  longitude: -58.6,
  phone: '11 5555 1111',
  active: true,
  hours: [],
}

const makeClient = () =>
  createTestClient((operation) => {
    switch (operation.operationName) {
      case 'AdminBranches':
        return { data: { branches: [rawBranch] } }
      case 'UpdateBranchHours':
        return { data: { updateBranchHours: [] } }
      default:
        return { data: {} }
    }
  })

const renderEdit = () => {
  const testClient = makeClient()
  renderWithProviders(
    <Routes>
      <Route path="/branches/:branchId/edit" element={<BranchEditPage />} />
    </Routes>,
    { route: '/branches/b1/edit', client: testClient.client },
  )
  return testClient
}

const openHours = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Horarios' }))
}

describe('BranchEditPage hours tab', () => {
  it('uses DEFAULT_HOURS when the branch has no hours', async () => {
    renderEdit()
    await screen.findByText('Centro')
    await openHours()

    expect(screen.getByLabelText('Apertura Lunes')).toHaveValue('09:00')
    expect(screen.getByLabelText('Cierre Lunes')).toHaveValue('23:00')
  })

  it('disables the time inputs when a day is closed', async () => {
    renderEdit()
    await screen.findByText('Centro')
    await openHours()

    await userEvent.click(screen.getByLabelText('Cerrado Lunes'))

    expect(screen.getByLabelText('Apertura Lunes')).toBeDisabled()
    expect(screen.getByLabelText('Cierre Lunes')).toBeDisabled()
  })

  it('disables save and shows a message when opening is not before closing', async () => {
    renderEdit()
    await screen.findByText('Centro')
    await openHours()

    fireEvent.change(screen.getByLabelText('Cierre Lunes'), { target: { value: '08:00' } })

    expect(await screen.findByText(/Revisá los horarios/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar horarios' })).toBeDisabled()
  })

  it('saves the mapped hours payload', async () => {
    const testClient = renderEdit()
    await screen.findByText('Centro')
    await openHours()

    await userEvent.click(screen.getByLabelText('Cerrado Lunes'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar horarios' }))

    await waitFor(() => expect(testClient.lastRequest('UpdateBranchHours')).toBeTruthy())

    const variables = operationVariables(testClient.lastRequest('UpdateBranchHours')) as {
      branchId: string
      hours: {
        dayOfWeek: number
        opening: string | null
        closing: string | null
        closed: boolean
      }[]
    }

    expect(variables.branchId).toBe('b1')
    expect(variables.hours).toHaveLength(7)
    expect(variables.hours.find((hour) => hour.dayOfWeek === 1)).toEqual({
      dayOfWeek: 1,
      opening: null,
      closing: null,
      closed: true,
    })
    expect(variables.hours.find((hour) => hour.dayOfWeek === 2)).toEqual({
      dayOfWeek: 2,
      opening: '09:00',
      closing: '23:00',
      closed: false,
    })
  })
})
