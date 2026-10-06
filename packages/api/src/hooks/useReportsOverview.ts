import { useQuery } from '@apollo/client'
import type { ReportFilter, ReportsOverview } from '@repo/domain'
import { REPORTS_OVERVIEW, toReportsOverview } from '../client/admin'

interface ReportsOverviewResult {
  reportsOverview: Record<string, unknown> | null
}

interface UseReportsOverviewOptions {
  skip?: boolean
}

interface UseReportsOverviewReturn {
  overview: ReportsOverview | null
  isLoading: boolean
  error: boolean
  refetch: () => void
}

export const useReportsOverview = (
  filter: ReportFilter = {},
  options: UseReportsOverviewOptions = {},
): UseReportsOverviewReturn => {
  const { data, loading, error, refetch } = useQuery<ReportsOverviewResult>(REPORTS_OVERVIEW, {
    variables: { filter },
    fetchPolicy: 'network-only',
    skip: options.skip,
  })

  return {
    overview: data?.reportsOverview ? toReportsOverview(data.reportsOverview) : null,
    isLoading: loading,
    error: Boolean(error),
    refetch: () => void refetch(),
  }
}
