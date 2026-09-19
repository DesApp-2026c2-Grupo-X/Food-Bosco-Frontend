import { BackButton } from '../BackButton'
import { EmptyState } from '../EmptyState'
import { PageHeader } from '../PageHeader'
import { PageTitle } from '../PageTitle'
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
