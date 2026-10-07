import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Parameter } from '@repo/domain'
import { useParameters } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { ParametersPage } from '../index'

vi.mock('@repo/api', () => ({ useParameters: vi.fn() }))

const parameter: Parameter = { key: 'MAX_DISTANCE_KM', value: 5, unit: 'km' }

const mockParameters = (overrides: Partial<ReturnType<typeof useParameters>> = {}) =>
  vi.mocked(useParameters).mockReturnValue({
    parameters: [parameter],
    isLoading: false,
    isMutating: false,
    update: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useParameters>)

describe('ParametersPage', () => {
  it('renders the parameters table', () => {
    mockParameters()

    renderWithProviders(<ParametersPage />)

    expect(
      screen.getByText('Distancia máxima para una sucursal disponible'),
    ).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('updates a parameter value', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    mockParameters({ update })

    renderWithProviders(<ParametersPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const input = await screen.findByPlaceholderText('Ej: 10')
    await userEvent.clear(input)
    await userEvent.type(input, '300')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(update).toHaveBeenCalledWith('MAX_DISTANCE_KM', 300))
  })

  it('rejects a zero value', async () => {
    const update = vi.fn()
    mockParameters({ update })

    renderWithProviders(<ParametersPage />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const input = await screen.findByPlaceholderText('Ej: 10')
    await userEvent.clear(input)
    await userEvent.type(input, '0')
    await userEvent.tab()

    expect(await screen.findByText('El valor debe ser mayor a 0')).toBeInTheDocument()
    expect(update).not.toHaveBeenCalled()
  })
})
