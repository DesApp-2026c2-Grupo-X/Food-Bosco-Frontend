import { useQuery } from '@apollo/client'
import type { CustomerRegistrationStats, ReportFilter } from '@repo/domain'
import { CUSTOMER_REGISTRATION_STATS, toCustomerRegistrationStats } from '../client/admin'

interface CustomerRegistrationStatsResult {
  customerRegistrationStats: Record<string, unknown> | null
}

interface UseCustomerRegistrationStatsOptions {
  skip?: boolean
}

interface UseCustomerRegistrationStatsReturn {
  stats: CustomerRegistrationStats | null
  isLoading: boolean
  error: boolean
  refetch: () => void
}

export const useCustomerRegistrationStats = (
  filter: ReportFilter = {},
  options: UseCustomerRegistrationStatsOptions = {},
): UseCustomerRegistrationStatsReturn => {
  const { data, loading, error, refetch } = useQuery<CustomerRegistrationStatsResult>(
    CUSTOMER_REGISTRATION_STATS,
    {
      variables: { filter },
      fetchPolicy: 'network-only',
      skip: options.skip,
    },
  )

  return {
    stats: data?.customerRegistrationStats
      ? toCustomerRegistrationStats(data.customerRegistrationStats)
      : null,
    isLoading: loading,
    error: Boolean(error),
    refetch: () => void refetch(),
  }
}
