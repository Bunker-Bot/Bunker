import { useQuery } from '@tanstack/react-query';
import { ProjectService, type FormattedProjectOverview } from '../lib/services/project.service';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useProjectOverview(projectId?: string) {
  const query = useQuery<FormattedProjectOverview | null, Error>({
    queryKey: ['projects', projectId, 'overview'],
    queryFn: () => (projectId ? ProjectService.getOverview(projectId) : Promise.resolve(null)),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5, // 5 minute intelligent cache
    refetchOnWindowFocus: false,
  });

  // Targeted Realtime channel subscription scoped to this project
  useRealtimeSubscription({
    table: 'projects',
    filter: projectId ? `id=eq.${projectId}` : undefined,
    queryKeyToInvalidate: ['projects', projectId, 'overview'],
    enabled: Boolean(projectId),
  });

  return query;
}

export default useProjectOverview;
