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

describe('ParametersPage states', () => {
  it('shows the empty state', () => {
    mockParameters({ parameters: [] })

    renderWithProviders(<ParametersPage />)

    expect(screen.getByText('Sin parámetros')).toBeInTheDocument()
  })

  it('shows the loading state', () => {
    mockParameters({ isLoading: true })
    const { container } = renderWithProviders(<ParametersPage />)

    expect(container.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
  })

  it('shows the key and unit as the modal subtitle', async () => {
    mockParameters()

    renderWithProviders(<ParametersPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))

    expect(await screen.findByText(/MAX_DISTANCE_KM · km/)).toBeInTheDocument()
  })

  it('falls back to the raw key for unknown parameters', async () => {
    mockParameters({ parameters: [{ key: 'CUSTOM_KEY', value: 7, unit: 'u' }] })

    renderWithProviders(<ParametersPage />)

    expect(screen.getByText('CUSTOM_KEY')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(await screen.findByText(/CUSTOM_KEY · u/)).toBeInTheDocument()
  })

  it('closes the modal on request', async () => {
    mockParameters()

    renderWithProviders(<ParametersPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(await screen.findByText('Editar parámetro')).toBeInTheDocument()

    const closeTrigger = document.querySelector('[data-part="close-trigger"]') as HTMLElement
    await userEvent.click(closeTrigger)

    await waitFor(() => expect(screen.queryByText('Editar parámetro')).not.toBeInTheDocument())
  })
})
