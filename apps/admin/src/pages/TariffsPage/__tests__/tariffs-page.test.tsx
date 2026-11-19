import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { DeliveryTariff } from '@repo/domain'
import { getApiErrorMessage, useDeliveryTariff } from '@repo/api'
import { renderWithProviders } from '@test/utils'
import { TariffsPage } from '../index'

vi.mock('@repo/api', () => ({
  useDeliveryTariff: vi.fn(),
  getApiErrorMessage: vi.fn(() => 'No tenés permisos para realizar esta acción.'),
}))

const tariff: DeliveryTariff = {
  id: 'tar-2',
  baseFare: 600,
  perKm: 250,
  perOrder: 350,
  currency: 'ARS',
  effectiveFrom: '2026-02-01T10:00:00.000Z',
  active: true,
  createdBy: 'admin-1',
  createdAt: '2026-02-01T10:00:00.000Z',
}

const history: DeliveryTariff[] = [
  tariff,
  {
    ...tariff,
    id: 'tar-1',
    baseFare: 500,
    perKm: 200,
    perOrder: 300,
    active: false,
    createdBy: 'system:bootstrap',
  },
]

const mockDeliveryTariff = (overrides: Partial<ReturnType<typeof useDeliveryTariff>> = {}) =>
  vi.mocked(useDeliveryTariff).mockReturnValue({
    data: tariff,
    history,
    loading: false,
    error: null,
    isPublishing: false,
    publish: vi.fn(),
    retry: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useDeliveryTariff>)

describe('TariffsPage', () => {
  it('muestra la tarifa vigente y el historial con autor y vigencia', () => {
    mockDeliveryTariff()

    renderWithProviders(<TariffsPage />)

    expect(screen.getByText('Tarifa vigente')).toBeInTheDocument()
    expect(screen.getByText('Historial')).toBeInTheDocument()
    expect(screen.getByText('admin-1')).toBeInTheDocument()
    expect(screen.getByText('system:bootstrap')).toBeInTheDocument()
    expect(screen.getByText('Vigente')).toBeInTheDocument()
    expect(screen.getByText('Histórica')).toBeInTheDocument()
    expect(screen.getByText('Moneda: ARS')).toBeInTheDocument()
  })

  it('permite editar los montos sin que el formulario se resetee', async () => {
    mockDeliveryTariff()

    renderWithProviders(<TariffsPage />)

    const baseFare = screen.getByLabelText(/Tarifa base/)
    const perKm = screen.getByLabelText(/Por km/)
    const perOrder = screen.getByLabelText(/Por pedido/)

    await waitFor(() => expect(baseFare).toHaveValue('600'))

    await userEvent.clear(baseFare)
    await userEvent.type(baseFare, '750')
    await userEvent.clear(perKm)
    await userEvent.type(perKm, '275')
    await userEvent.clear(perOrder)
    await userEvent.type(perOrder, '375')

    expect(baseFare).toHaveValue('750')
    expect(perKm).toHaveValue('275')
    expect(perOrder).toHaveValue('375')
  })

  it('precarga el formulario y publica con confirmación', async () => {
    const publish = vi.fn().mockResolvedValue(undefined)
    mockDeliveryTariff({ publish })

    renderWithProviders(<TariffsPage />)

    await waitFor(() => expect(screen.getByLabelText(/Tarifa base/)).toHaveValue('600'))
    expect(screen.getByLabelText(/Por km/)).toHaveValue('250')
    expect(screen.getByLabelText(/Por pedido/)).toHaveValue('350')

    const submit = screen.getByRole('button', { name: 'Publicar tarifa' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    expect(
      screen.getByText(
        'La tarifa anterior dejará de aplicarse a las ofertas nuevas. Los viajes ya ofertados conservan la tarifa con la que se ofertaron.',
      ),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar publicación' }))

    await waitFor(() =>
      expect(publish).toHaveBeenCalledWith({
        baseFare: 600,
        perKm: 250,
        perOrder: 350,
        currency: 'ARS',
      }),
    )
  })

  it('muestra el error de permisos al intentar publicar', async () => {
    const publish = vi.fn().mockRejectedValue(new Error('forbidden'))
    mockDeliveryTariff({ publish })

    renderWithProviders(<TariffsPage />)

    const submit = screen.getByRole('button', { name: 'Publicar tarifa' })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar publicación' }))

    expect(
      await screen.findByText('No tenés permisos para realizar esta acción.'),
    ).toBeInTheDocument()
    expect(getApiErrorMessage).toHaveBeenCalled()
  })

  it('muestra el error de carga y permite reintentar', async () => {
    const retry = vi.fn().mockResolvedValue(undefined)
    mockDeliveryTariff({ data: null, history: [], error: new Error('boom'), retry })

    renderWithProviders(<TariffsPage />)

    expect(screen.getByText('No pudimos cargar las tarifas')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(retry).toHaveBeenCalled()
  })
})
