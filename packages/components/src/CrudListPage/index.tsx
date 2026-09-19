import { DataTable } from '../DataTable'
import { ListToolbar } from '../ListToolbar'
import { PageHeader } from '../PageHeader'
import { WidePageContainer } from '../WidePageContainer'
import type { CrudListPageProps } from './types'

export const CrudListPage = <T,>({
  title,
  description,
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

    {toolbar != null || action != null ? <ListToolbar filters={toolbar} action={action} /> : null}

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
