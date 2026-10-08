import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@test/utils'
import { DataTable } from '../DataTable'
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

describe('DataTable', () => {
  it('renderiza el estado de error por encima de las filas', () => {
    renderWithProviders(
      <DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} error />,
    )

    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument()
    expect(screen.queryByText('Uno')).not.toBeInTheDocument()
  })

  it('renderiza tantas filas de esqueleto como skeletonRows', () => {
    const { container } = renderWithProviders(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        isLoading
        skeletonRows={3}
      />,
    )

    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
  })

  it('muestra el vacío por defecto y el personalizado', () => {
    const { unmount } = renderWithProviders(
      <DataTable columns={columns} rows={[]} getRowKey={(row) => row.id} />,
    )
    expect(screen.getByText('No hay resultados')).toBeInTheDocument()
    unmount()

    renderWithProviders(
      <DataTable
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        emptyTitle="Vacío"
        emptyDescription="Nada aquí"
      />,
    )
    expect(screen.getByText('Vacío')).toBeInTheDocument()
    expect(screen.getByText('Nada aquí')).toBeInTheDocument()
  })

  it('solo llama onRowClick cuando se provee', async () => {
    const onRowClick = vi.fn()
    const { container, unmount } = renderWithProviders(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        onRowClick={onRowClick}
      />,
    )

    const clickableRow = container.querySelector('tbody tr') as HTMLElement
    expect(window.getComputedStyle(clickableRow).cursor).toBe('pointer')
    await userEvent.click(screen.getByText('Uno'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
    unmount()

    const { container: plain } = renderWithProviders(
      <DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} />,
    )
    expect(window.getComputedStyle(plain.querySelector('tbody tr') as HTMLElement).cursor).not.toBe(
      'pointer',
    )
  })

  it('usa getRowKey para cada fila', () => {
    const getRowKey = vi.fn((row: Row) => row.id)
    renderWithProviders(<DataTable columns={columns} rows={rows} getRowKey={getRowKey} />)

    expect(getRowKey).toHaveBeenCalledWith(rows[0])
    expect(getRowKey).toHaveBeenCalledWith(rows[1])
  })
})
