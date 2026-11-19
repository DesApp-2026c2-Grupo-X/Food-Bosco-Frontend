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
    expect(screen.getByText('Cargando datos…')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
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

  it('no muestra controles de paginación cuando no hay pageSize o rows.length <= pageSize', () => {
    const { unmount } = renderWithProviders(
      <DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} />,
    )
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument()
    unmount()

    renderWithProviders(
      <DataTable columns={columns} rows={rows} getRowKey={(row) => row.id} pageSize={2} />,
    )
    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument()
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Dos')).toBeInTheDocument()
  })

  it('pagina las filas cuando rows.length > pageSize y respeta los límites de navegación', async () => {
    const manyRows: Row[] = [
      { id: '1', name: 'Uno' },
      { id: '2', name: 'Dos' },
      { id: '3', name: 'Tres' },
      { id: '4', name: 'Cuatro' },
      { id: '5', name: 'Cinco' },
    ]

    renderWithProviders(
      <DataTable columns={columns} rows={manyRows} getRowKey={(row) => row.id} pageSize={2} />,
    )

    expect(screen.getByText('Mostrando 1–2 de 5')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Dos')).toBeInTheDocument()
    expect(screen.queryByText('Tres')).not.toBeInTheDocument()

    const prevButton = screen.getByRole('button', { name: 'Anterior' })
    const nextButton = screen.getByRole('button', { name: 'Siguiente' })
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeEnabled()

    await userEvent.click(nextButton)
    expect(screen.getByText('Mostrando 3–4 de 5')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByText('Tres')).toBeInTheDocument()
    expect(screen.getByText('Cuatro')).toBeInTheDocument()
    expect(screen.queryByText('Uno')).not.toBeInTheDocument()
    expect(prevButton).toBeEnabled()

    await userEvent.click(nextButton)
    expect(screen.getByText('Mostrando 5–5 de 5')).toBeInTheDocument()
    expect(screen.getByText('Página 3 de 3')).toBeInTheDocument()
    expect(screen.getByText('Cinco')).toBeInTheDocument()
    expect(nextButton).toBeDisabled()

    await userEvent.click(prevButton)
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByText('Tres')).toBeInTheDocument()
  })
})
