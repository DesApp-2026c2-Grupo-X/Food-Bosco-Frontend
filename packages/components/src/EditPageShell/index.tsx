import { BackButton } from '../BackButton'
import { EmptyState, LoadingState } from '../feedback'
import { PageHeader } from '../PageHeader'
import { PageTitle } from '../typography'
import { WidePageContainer } from '../WidePageContainer'
import type { EditPageShellProps } from './types'

export const EditPageShell = ({
  isNew,
  isLoading,
  hasEntity,
  title,
  loadingTitle,
  notFound,
  blocked,
  children,
}: EditPageShellProps) => {
  if (!isNew && isLoading) {
    return (
      <WidePageContainer>
        <BackButton />
        <PageTitle>{loadingTitle}</PageTitle>
        <LoadingState variant="list" skeletonCount={3} skeletonHeight="72px" />
      </WidePageContainer>
    )
  }

  if (!isNew && !hasEntity) {
    return (
      <WidePageContainer>
        <BackButton />
        <EmptyState title={notFound.title} description={notFound.description} />
      </WidePageContainer>
    )
  }

  if (blocked?.when) {
    return (
      <WidePageContainer>
        <BackButton />
        <EmptyState title={blocked.title} description={blocked.description} />
      </WidePageContainer>
    )
  }

  return (
    <WidePageContainer>
      <BackButton />
      <PageHeader title={title} />
      {children}
    </WidePageContainer>
  )
}
