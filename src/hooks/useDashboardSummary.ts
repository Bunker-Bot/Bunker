import { useQuery } from '@tanstack/react-query';
import { DashboardService, type FormattedDashboardSummary } from '../lib/services/dashboard.service';

export function useDashboardSummary() {
  return useQuery<FormattedDashboardSummary, Error>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => DashboardService.getSummary(),
    staleTime: 1000 * 60 * 5, // 5 minute intelligent cache
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export default useDashboardSummary;
