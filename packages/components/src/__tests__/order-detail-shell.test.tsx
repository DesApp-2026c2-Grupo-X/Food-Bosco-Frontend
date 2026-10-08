import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { OrderDetailShell } from '../OrderDetailShell'

describe('OrderDetailShell', () => {
  it('usa el número de pedido y el fallback', () => {
    const { unmount } = renderWithProviders(
      <OrderDetailShell orderNumber={101} status="PENDING">
        <div>Contenido</div>
      </OrderDetailShell>,
    )
    expect(screen.getByText('Pedido #101')).toBeInTheDocument()
    unmount()

    renderWithProviders(
      <OrderDetailShell status="PENDING">
        <div>Contenido</div>
      </OrderDetailShell>,
    )
    expect(screen.getByText('Pedido')).toBeInTheDocument()
  })

  it('muestra el badge de estado', () => {
    renderWithProviders(
      <OrderDetailShell orderNumber={7} status="DELIVERED" description="Entregado hoy">
        <div>Contenido</div>
      </OrderDetailShell>,
    )

    expect(screen.getByText('Entregado')).toBeInTheDocument()
    expect(screen.getByText('Entregado hoy')).toBeInTheDocument()
  })

  it('muestra u oculta el botón de volver', () => {
    const { unmount } = renderWithProviders(
      <OrderDetailShell orderNumber={1} status="PENDING">
        <div>Contenido</div>
      </OrderDetailShell>,
    )
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
    unmount()

    renderWithProviders(
      <OrderDetailShell orderNumber={1} status="PENDING" showBack={false}>
        <div>Contenido</div>
      </OrderDetailShell>,
    )
    expect(screen.queryByRole('button', { name: 'Volver' })).not.toBeInTheDocument()
  })
})
