import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TimelineService } from '../../services/timeline.service';
import { timelineKeys } from '../../constants/query-keys';

export { timelineKeys };

/**
 * Main Progressive Timeline Hook with Infinite Pagination (20 items per page)
 */
export const useProjectUpdates = (
  projectId: string,
  search = '',
  category = 'all',
  dateFrom: string | null = null,
  dateTo: string | null = null
) => {
  return useInfiniteQuery({
    queryKey: timelineKeys.filters(projectId, category, dateFrom, dateTo),
    queryFn: async ({ pageParam = 0 }) => {
      return TimelineService.getUpdatesPaginated({
        projectId,
        limit: 20,
        offset: pageParam,
        search,
        category,
        dateFrom,
        dateTo,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((acc, p) => acc + p.items.length, 0);
    },
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: 2,
  });
};

/**
 * Alias for useProjectUpdates
 */
export const useInfiniteTimeline = useProjectUpdates;

/**
 * Mutation Hook to Create a Project Timeline Update with Optimistic Cache Updates
 */
export const useCreateProjectUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      project_id: string;
      title: string;
      description?: string;
      entry_date?: string;
      attachments?: any[];
    }) => TimelineService.createUpdate(payload),

    // Optimistic cache update inserting into page 1
    onMutate: async (newUpdate) => {
      const queryKey = timelineKeys.project(newUpdate.project_id);
      await queryClient.cancelQueries({ queryKey });

      const previousTimelineData = queryClient.getQueryData(queryKey);

      queryClient.setQueriesData({ queryKey }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        const optimisticItem = {
          id: `temp-${Date.now()}`,
          project_id: newUpdate.project_id,
          title: newUpdate.title,
          description: newUpdate.description || '',
          entry_date: newUpdate.entry_date || new Date().toISOString().split('T')[0],
          attachments: newUpdate.attachments || [],
          created_at: new Date().toISOString(),
          isOptimistic: true,
        };

        const updatedPages = [...oldData.pages];
        if (updatedPages.length > 0) {
          updatedPages[0] = {
            ...updatedPages[0],
            items: [optimisticItem, ...updatedPages[0].items],
            totalCount: (updatedPages[0].totalCount || 0) + 1,
          };
        }

        return { ...oldData, pages: updatedPages };
      });

      return { previousTimelineData };
    },

    onError: (_err, newUpdate, context: any) => {
      if (context?.previousTimelineData) {
        queryClient.setQueryData(
          timelineKeys.project(newUpdate.project_id),
          context.previousTimelineData
        );
      }
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.project(variables.project_id) });
    },
  });
};

/**
 * Alias for useCreateProjectUpdate
 */
export const useCreateTimelineUpdate = useCreateProjectUpdate;

/**
 * Mutation Hook to Edit a Project Timeline Update Entry
 */
export const useUpdateProjectUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      projectId: string;
      payload: {
        title?: string;
        description?: string;
        entry_date?: string;
        attachments?: any[];
      };
    }) => TimelineService.updateUpdate(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.project(variables.projectId) });
    },
  });
};

/**
 * Alias for useUpdateProjectUpdate
 */
export const useUpdateTimelineUpdate = useUpdateProjectUpdate;

/**
 * Mutation Hook to Delete a Project Timeline Update Entry
 */
export const useDeleteProjectUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      TimelineService.deleteUpdate(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.project(variables.projectId) });
    },
  });
};

/**
 * Alias for useDeleteProjectUpdate
 */
export const useDeleteTimelineUpdate = useDeleteProjectUpdate;

/**
 * Future Hook: Search Timeline Updates
 */
export const useTimelineSearch = (projectId: string, searchQuery: string) => {
  return useQuery({
    queryKey: timelineKeys.search(projectId, searchQuery),
    queryFn: () => TimelineService.getUpdatesPaginated({ projectId, search: searchQuery, limit: 10 }),
    enabled: Boolean(projectId && searchQuery.trim()),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Future Hook: Filter Timeline Updates
 */
export const useTimelineFilters = (
  projectId: string,
  category: string,
  dateFrom: string | null = null,
  dateTo: string | null = null
) => {
  return useQuery({
    queryKey: timelineKeys.filters(projectId, category, dateFrom, dateTo),
    queryFn: () =>
      TimelineService.getUpdatesPaginated({
        projectId,
        category,
        dateFrom,
        dateTo,
        limit: 20,
      }),
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Future Hook: Timeline Overview Statistics
 */
export const useTimelineStatistics = (projectId: string) => {
  return useQuery({
    queryKey: [...timelineKeys.project(projectId), 'statistics'],
    queryFn: async () => {
      const res = await TimelineService.getUpdatesPaginated({ projectId, limit: 1 });
      return {
        totalUpdates: res.totalCount,
        latestUpdateDate: res.items[0]?.created_at || res.items[0]?.entry_date || null,
      };
    },
    enabled: Boolean(projectId),
    staleTime: 5 * 60 * 1000,
  });
};
