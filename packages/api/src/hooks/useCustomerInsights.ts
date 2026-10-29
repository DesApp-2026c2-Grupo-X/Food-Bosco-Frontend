import { useQuery } from '@apollo/client'
import type { CustomerInsightsFilter, CustomerInsightsOverview } from '@repo/domain'
import { CUSTOMER_INSIGHTS, toCustomerInsightsOverview } from '../client/admin'

interface CustomerInsightsResult {
  customerInsights: Record<string, unknown> | null
}

interface UseCustomerInsightsOptions {
  skip?: boolean
}

interface UseCustomerInsightsReturn {
  overview: CustomerInsightsOverview | null
  isLoading: boolean
  error: boolean
  refetch: () => void
}

export const useCustomerInsights = (
  filter: CustomerInsightsFilter = {},
  options: UseCustomerInsightsOptions = {},
): UseCustomerInsightsReturn => {
  const { data, loading, error, refetch } = useQuery<CustomerInsightsResult>(CUSTOMER_INSIGHTS, {
    variables: { filter },
    fetchPolicy: 'network-only',
    skip: options.skip,
  })

  return {
    overview: data?.customerInsights ? toCustomerInsightsOverview(data.customerInsights) : null,
    isLoading: loading,
    error: Boolean(error),
    refetch: () => void refetch(),
  }
}
