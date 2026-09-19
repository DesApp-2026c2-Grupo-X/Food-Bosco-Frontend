import { HStack } from '@chakra-ui/react'
import { DataTable } from '../DataTable'
import { PageHeader } from '../PageHeader'
import { SearchInput } from '../SearchInput'
import { WidePageContainer } from '../WidePageContainer'
import type { CrudListPageProps } from './types'

export const CrudListPage = <T,>({
  title,
  description,
  search,
  toolbar,
  action,
  isLoading,
  rows,
  columns,
  getRowKey,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  modals,
}: CrudListPageProps<T>) => (
  <WidePageContainer>
    <PageHeader title={title} description={description} />

    {search != null || toolbar != null || action != null ? (
      <HStack justify="space-between" align="center" width="full" wrap="wrap" gap="3">
        <HStack gap="3" wrap="wrap" width="auto" flexGrow="1">
          {search ? (
            <SearchInput
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder}
            />
          ) : null}
          {toolbar}
        </HStack>
        {action}
      </HStack>
    ) : null}

    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={getRowKey}
      isLoading={isLoading}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />

    {modals}
  </WidePageContainer>
)
