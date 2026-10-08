import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { KpiCard } from '../KpiCard'

describe('KpiCard', () => {
  it('muestra subida con flecha y color success', () => {
    renderWithProviders(<KpiCard title="Ingresos" value="$ 10" variation={12.5} />)

    const arrow = screen.getByText('▲')
    expect(window.getComputedStyle(arrow.parentElement as HTMLElement).color).toContain('success')
    expect(screen.getByText('+12,5%')).toBeInTheDocument()
    expect(screen.getByText('vs. período anterior')).toBeInTheDocument()
  })

  it('muestra bajada con flecha y color danger', () => {
    renderWithProviders(<KpiCard title="Ingresos" value="$ 10" variation={-5} />)

    const arrow = screen.getByText('▼')
    expect(window.getComputedStyle(arrow.parentElement as HTMLElement).color).toContain('danger')
    expect(screen.getByText('-5%')).toBeInTheDocument()
  })

  it('muestra guion y color muted cuando la variación es cero', () => {
    renderWithProviders(<KpiCard title="Ingresos" value="$ 10" variation={0} />)

    const arrow = screen.getByText('—')
    expect(window.getComputedStyle(arrow.parentElement as HTMLElement).color).toContain('muted')
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('omite la fila de variación cuando es null', () => {
    renderWithProviders(<KpiCard title="Ingresos" value="$ 10" variation={null} />)

    expect(screen.queryByText('▲')).not.toBeInTheDocument()
    expect(screen.queryByText('▼')).not.toBeInTheDocument()
    expect(screen.queryByText('vs. período anterior')).not.toBeInTheDocument()
  })

  it('formatea el porcentaje con signo y decimales', () => {
    const { unmount } = renderWithProviders(<KpiCard title="t" value="v" variation={8} />)
    expect(screen.getByText('+8%')).toBeInTheDocument()
    unmount()

    renderWithProviders(<KpiCard title="t" value="v" variation={2.5} />)
    expect(screen.getByText('+2,5%')).toBeInTheDocument()
  })

  it('renderiza el hint', () => {
    renderWithProviders(<KpiCard title="t" value="v" hint="Solo pedidos pagados" />)

    expect(screen.getByText('Solo pedidos pagados')).toBeInTheDocument()
  })

  it('permite sobrescribir variationLabel', () => {
    const { unmount } = renderWithProviders(
      <KpiCard title="t" value="v" variation={3} variationLabel="vs. semana pasada" />,
    )
    expect(screen.getByText('vs. semana pasada')).toBeInTheDocument()
    expect(screen.queryByText('vs. período anterior')).not.toBeInTheDocument()
    unmount()

    renderWithProviders(<KpiCard title="t" value="v" variation={3} />)
    expect(screen.getByText('vs. período anterior')).toBeInTheDocument()
  })
})
