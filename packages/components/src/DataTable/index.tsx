import { Skeleton, Table } from '@chakra-ui/react'
import { EmptyState } from '../EmptyState'
import type { DataTableProps, ResponsiveBreakpoint } from './types'

const HIDE_MAP: Record<ResponsiveBreakpoint, Record<string, string>> = {
  sm: { base: 'none', sm: 'table-cell' },
  md: { base: 'none', md: 'table-cell' },
  lg: { base: 'none', lg: 'table-cell' },
}

export const DataTable = <T,>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  error = false,
  emptyTitle = 'No hay resultados',
  emptyDescription = 'No se encontraron registros para mostrar.',
  onRowClick,
  skeletonRows = 5,
}: DataTableProps<T>) => {
  if (error) {
    return (
      <EmptyState
        title="Ocurrió un error"
        description="No pudimos cargar la información. Intentá de nuevo."
      />
    )
  }

  if (!isLoading && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <Table.ScrollArea width="full">
      <Table.Root variant="outline" size="sm" width="full">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeader
                key={column.key}
                display={column.hideBelow ? HIDE_MAP[column.hideBelow] : undefined}
              >
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <Table.Row key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <Table.Cell key={column.key}>
                      <Skeleton height="4" width="80%" />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            : rows.map((row) => (
                <Table.Row
                  key={getRowKey(row)}
                  cursor={onRowClick ? 'pointer' : undefined}
                  _hover={onRowClick ? { bg: 'bg.subtle' } : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <Table.Cell
                      key={column.key}
                      display={column.hideBelow ? HIDE_MAP[column.hideBelow] : undefined}
                    >
                      {column.render(row)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
