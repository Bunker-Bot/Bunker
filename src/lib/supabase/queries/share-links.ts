import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShareService, type FormattedShareLink } from '../../services/share.service';
import type { CreateShareLinkPayload } from '../../repositories/share.repository';

// Centralized Query Keys Factory
export const shareLinkKeys = {
  all: ['share-links'] as const,
  lists: () => [...shareLinkKeys.all, 'list'] as const,
  list: (projectId?: string) => [...shareLinkKeys.lists(), { projectId }] as const,
  details: () => [...shareLinkKeys.all, 'detail'] as const,
  detail: (id: string) => [...shareLinkKeys.details(), id] as const,
  analyticsGroup: () => [...shareLinkKeys.all, 'analytics'] as const,
  analytics: (id: string) => [...shareLinkKeys.analyticsGroup(), id] as const,
  analyticsSummary: (projectId?: string) => [...shareLinkKeys.all, 'summary', { projectId }] as const,
};

/**
 * useShareLinks(projectId)
 * Purpose: Fetch all share links for a project or all projects.
 */
export const useShareLinks = (projectId?: string) => {
  return useQuery({
    queryKey: shareLinkKeys.list(projectId),
    queryFn: () => ShareService.getShareLinks(projectId),
    staleTime: 1000 * 30, // 30 seconds staleTime
    gcTime: 1000 * 60 * 10,
    networkMode: 'online',
  });
};

/**
 * useGenerateShareLink()
 * Purpose: Create a new cryptographically secure share link.
 */
export const useGenerateShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      plainPassword,
    }: {
      payload: CreateShareLinkPayload;
      plainPassword?: string;
    }) => ShareService.createShareLink(payload, plainPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shareLinkKeys.all });
    },
  });
};

/**
 * useDisableShareLink() / useToggleShareLink()
 * Purpose: Soft toggle active/disabled status of a share link.
 */
export const useDisableShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentIsActive }: { id: string; currentIsActive: boolean }) =>
      ShareService.toggleStatus(id, currentIsActive),
    onMutate: async ({ id, currentIsActive }) => {
      await queryClient.cancelQueries({ queryKey: shareLinkKeys.all });
      const previousLinks = queryClient.getQueriesData({ queryKey: shareLinkKeys.lists() });

      queryClient.setQueriesData({ queryKey: shareLinkKeys.lists() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((l: FormattedShareLink) =>
          l.id === id
            ? { ...l, status: currentIsActive ? 'disabled' : 'active' }
            : l
        );
      });

      return { previousLinks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLinks) {
        context.previousLinks.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shareLinkKeys.all });
    },
  });
};

/**
 * useRegenerateShareLink()
 * Purpose: Regenerate token for existing share link (invalidating old token immediately).
 */
export const useRegenerateShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShareService.regenerateShareLink(id),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: shareLinkKeys.all });
      if (updatedItem?.id) {
        queryClient.invalidateQueries({ queryKey: shareLinkKeys.detail(updatedItem.id) });
      }
    },
  });
};

/**
 * useDeleteShareLink()
 * Purpose: Delete / revoke share link with optimistic removal from list.
 */
export const useDeleteShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShareService.deleteShareLink(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: shareLinkKeys.all });
      const previousLinks = queryClient.getQueriesData({ queryKey: shareLinkKeys.lists() });

      queryClient.setQueriesData({ queryKey: shareLinkKeys.lists() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((l: FormattedShareLink) => l.id !== id);
      });

      return { previousLinks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLinks) {
        context.previousLinks.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shareLinkKeys.all });
    },
  });
};

/**
 * useShareLinkAnalytics(shareLinkId)
 * Purpose: Lazily load analytics events for a specific share link.
 */
export const useShareLinkAnalytics = (shareLinkId: string | null) => {
  return useQuery({
    queryKey: shareLinkKeys.analytics(shareLinkId || ''),
    queryFn: () => ShareService.getShareLinkAnalytics(shareLinkId!),
    enabled: Boolean(shareLinkId),
    staleTime: 1000 * 60 * 5, // 5 minutes staleTime for analytics
    gcTime: 1000 * 60 * 15,
  });
};

/**
 * useShareLinkAnalyticsSummary(projectId, links)
 * Purpose: Lazily load overall analytics summary data for the panel.
 */
export const useShareLinkAnalyticsSummary = (
  projectId?: string,
  links: FormattedShareLink[] = []
) => {
  return useQuery({
    queryKey: shareLinkKeys.analyticsSummary(projectId),
    queryFn: () => ShareService.getOverallAnalyticsSummary(projectId, links),
    staleTime: 1000 * 60 * 2, // 2 minutes staleTime
    enabled: links.length > 0,
  });
};
