import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { CrudListPage } from '../CrudListPage'
import type { DataTableColumn } from '../DataTable/types'

interface Row {
  id: string
  name: string
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Nombre', render: (row) => row.name },
]

const rows: Row[] = [
  { id: '1', name: 'Uno' },
  { id: '2', name: 'Dos' },
]

const baseProps = {
  title: 'Listado',
  rows,
  columns,
  getRowKey: (row: Row) => row.id,
}

describe('CrudListPage', () => {
  it('renderiza título y descripción', () => {
    renderWithProviders(<CrudListPage {...baseProps} description="Detalle de la lista" />)

    expect(screen.getByRole('heading', { name: 'Listado' })).toBeInTheDocument()
    expect(screen.getByText('Detalle de la lista')).toBeInTheDocument()
  })

  it('emite el valor de búsqueda', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <CrudListPage
        {...baseProps}
        search={{ value: '', onChange, placeholder: 'Buscar aquí...' }}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Buscar aquí...'), { target: { value: 'queso' } })

    expect(onChange).toHaveBeenCalledWith('queso')
  })

  it('renderiza toolbar y action', () => {
    renderWithProviders(
      <CrudListPage
        {...baseProps}
        toolbar={<div>Barra de filtros</div>}
        action={<button type="button">Nuevo</button>}
      />,
    )

    expect(screen.getByText('Barra de filtros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument()
  })

  it('integra DataTable con filas, esqueleto y vacío', () => {
    const { unmount } = renderWithProviders(<CrudListPage {...baseProps} />)
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Dos')).toBeInTheDocument()
    unmount()

    const { container: loading } = renderWithProviders(<CrudListPage {...baseProps} isLoading />)
    expect(loading.querySelectorAll('tbody tr')).toHaveLength(5)
    unmount()

    renderWithProviders(
      <CrudListPage {...baseProps} rows={[]} emptyTitle="Vacío" emptyDescription="Sin registros" />,
    )
    expect(screen.getByText('Vacío')).toBeInTheDocument()
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
  })

  it('renderiza el slot de modales', () => {
    renderWithProviders(<CrudListPage {...baseProps} modals={<div>Modal aquí</div>} />)

    expect(screen.getByText('Modal aquí')).toBeInTheDocument()
  })
})
