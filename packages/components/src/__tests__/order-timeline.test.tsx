import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { OrderStatus } from '@repo/domain'
import { renderWithProviders } from '@test/utils'
import { OrderTimeline } from '../OrderTimeline'

const LABELS = ['Pendiente', 'Confirmado', 'Preparando', 'En camino', 'Entregado']

const activeIndex = (status: OrderStatus): number => {
  const { unmount } = renderWithProviders(<OrderTimeline status={status} />)
  const index = LABELS.findIndex((label) =>
    window.getComputedStyle(screen.getByText(label)).fontWeight.includes('semibold'),
  )
  unmount()
  return index
}

describe('OrderTimeline', () => {
  it('renderiza los cinco pasos', () => {
    renderWithProviders(<OrderTimeline status="PENDING" />)

    LABELS.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
  })

  it.each<[OrderStatus, number]>([
    ['PENDING', 0],
    ['CONFIRMED', 1],
    ['PREPARING', 2],
    ['READY_FOR_DELIVERY', 3],
    ['ON_THE_WAY', 3],
    ['DELIVERED', 4],
    ['CANCELLED', -1],
  ])('marca el paso activo para %s', (status, expected) => {
    expect(activeIndex(status)).toBe(expected)
  })
})
