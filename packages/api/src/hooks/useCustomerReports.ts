import { useQuery } from '@apollo/client'
import type { CustomerReportFilter, CustomerReportsOverview } from '@repo/domain'
import { MY_REPORTS_OVERVIEW, toCustomerReportsOverview } from '../client/store'

interface MyReportsOverviewResult {
  myReportsOverview: Record<string, unknown> | null
}

interface UseCustomerReportsOptions {
  skip?: boolean
}

interface UseCustomerReportsReturn {
  overview: CustomerReportsOverview | null
  isLoading: boolean
  error: boolean
  refetch: () => void
}

export const useCustomerReports = (
  filter: CustomerReportFilter = {},
  options: UseCustomerReportsOptions = {},
): UseCustomerReportsReturn => {
  const { data, loading, error, refetch } = useQuery<MyReportsOverviewResult>(MY_REPORTS_OVERVIEW, {
    variables: { filter },
    fetchPolicy: 'network-only',
    skip: options.skip,
  })

  return {
    overview: data?.myReportsOverview ? toCustomerReportsOverview(data.myReportsOverview) : null,
    isLoading: loading,
    error: Boolean(error),
    refetch: () => void refetch(),
  }
}
