import { useState } from 'react'
import { Box, HStack, Skeleton, Spinner, Table, Text } from '@chakra-ui/react'
import { SecondaryButton } from '../Button'
import { EmptyState } from '../feedback'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
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
  emptyIcon,
  onRowClick,
  skeletonRows = 5,
  pageSize,
}: DataTableProps<T>) => {
  const reducedMotion = usePrefersReducedMotion()
  const [page, setPage] = useState(1)

  const hasPagination = typeof pageSize === 'number' && pageSize > 0
  const totalPages = hasPagination ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const currentPage = Math.min(page, totalPages)
  const visibleRows = hasPagination
    ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : rows
  const showPaginationFooter = !isLoading && hasPagination && rows.length > pageSize
  const rangeStart = showPaginationFooter ? (currentPage - 1) * pageSize + 1 : 0
  const rangeEnd = showPaginationFooter ? Math.min(currentPage * pageSize, rows.length) : 0

  if (error) {
    return (
      <EmptyState
        title="Ocurrió un error"
        description="No pudimos cargar la información. Intentá de nuevo."
      />
    )
  }

  if (!isLoading && rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <>
      {isLoading ? (
        <HStack role="status" aria-live="polite" gap="2" paddingY="2">
          <Spinner size="sm" color="brand.600" />
          <Text fontSize="sm" color="fg.muted">
            Cargando datos…
          </Text>
        </HStack>
      ) : null}

      <Box
        width="full"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="2xl"
        overflow="hidden"
        bg="bg.panel"
        aria-busy={isLoading}
      >
        <Table.ScrollArea width="full">
          <Table.Root variant="line" size="md" width="full">
            <Table.Header>
              <Table.Row bg="bg.muted">
                {columns.map((column) => (
                  <Table.ColumnHeader
                    key={column.key}
                    display={column.hideBelow ? HIDE_MAP[column.hideBelow] : undefined}
                    width={column.width}
                    minWidth={column.minWidth}
                    maxWidth={column.maxWidth}
                    color="brand.600"
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    paddingY="3"
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
                          <Skeleton
                            height="4"
                            width="80%"
                            animation={reducedMotion ? 'none' : undefined}
                          />
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                : visibleRows.map((row) => (
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
                          width={column.width}
                          minWidth={column.minWidth}
                          maxWidth={column.maxWidth}
                          paddingY="3.5"
                        >
                          {column.render(row)}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>

      {showPaginationFooter ? (
        <HStack
          justify="space-between"
          align="center"
          width="full"
          wrap="wrap"
          gap="3"
          paddingTop="3"
        >
          <Text fontSize="sm" color="fg.muted">
            Mostrando {rangeStart}–{rangeEnd} de {rows.length}
          </Text>
          <HStack gap="2" align="center">
            <SecondaryButton
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Anterior
            </SecondaryButton>
            <Text fontSize="sm" color="fg.muted">
              Página {currentPage} de {totalPages}
            </Text>
            <SecondaryButton
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Siguiente
            </SecondaryButton>
          </HStack>
        </HStack>
      ) : null}
    </>
  )
}
