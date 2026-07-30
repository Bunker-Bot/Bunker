import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GithubService } from '../../services/github.service';
import { githubKeys } from '../../constants/query-keys';
import { supabase } from '../client';

export { githubKeys };

const GITHUB_QUERY_CONFIG = {
  retry: 2,
  staleTime: 10 * 60 * 1000,
  gcTime: 20 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
};

export const useGithubRepositories = () => {
  return useQuery({
    queryKey: ['github', 'all-repositories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .order('last_synced_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    ...GITHUB_QUERY_CONFIG,
  });
};

export const useGithubRepository = (projectId: string) => {
  return useQuery({
    queryKey: githubKeys.project(projectId),
    queryFn: () => GithubService.getGithubRepository(projectId),
    enabled: Boolean(projectId),
    ...GITHUB_QUERY_CONFIG,
  });
};

/**
 * Fetch Live Telemetry (commits, PRs, workflows, issues, contributors, languages) via Edge Function.
 * Returns the full sync response object with all collections.
 */
export const useGithubLiveTelemetry = (projectId: string, repoUrl?: string) => {
  return useQuery({
    queryKey: ['github', 'telemetry', projectId, repoUrl],
    queryFn: () => GithubService.syncGithubRepository(projectId, repoUrl, false),
    enabled: Boolean(projectId && repoUrl),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * All tab-specific hooks read from the shared telemetry cache.
 * They do NOT fire separate network requests — they read what useGithubLiveTelemetry already fetched.
 */
const useTelemetrySlice = <T>(projectId: string, repoUrl: string | undefined, selector: (data: any) => T, enabled = true) => {
  return useQuery({
    queryKey: ['github', 'telemetry', projectId, repoUrl],
    queryFn: () => GithubService.syncGithubRepository(projectId, repoUrl, false),
    enabled: Boolean(projectId && repoUrl) && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: selector,
  });
};

export const useGithubCommits = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => data?.commits || [], enabled);
};

export const useGithubPullRequests = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => data?.pullRequests || [], enabled);
};

export const useGithubActions = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => data?.workflows || [], enabled);
};

export const useGithubIssues = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => data?.issues || [], enabled);
};

export const useGithubContributors = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => data?.contributors || [], enabled);
};

export const useGithubLanguages = (projectId: string, repoUrl?: string, enabled = true) => {
  return useTelemetrySlice(projectId, repoUrl, (data) => {
    const raw = data?.languages;
    if (!raw || typeof raw !== 'object') return [];
    const total = Object.values(raw as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(raw as Record<string, number>).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 100),
    })).sort((a, b) => b.bytes - a.bytes);
  }, enabled);
};

export const useValidateGithubRepository = (owner: string, repo: string, enabled = true) => {
  return useQuery({
    queryKey: githubKeys.validate(owner, repo),
    queryFn: () => GithubService.validateRepository(owner, repo),
    enabled: enabled && Boolean(owner && repo),
    ...GITHUB_QUERY_CONFIG,
    retry: 1,
  });
};

export const useSyncGithubRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, repoUrl, force = false }: { projectId: string; repoUrl?: string; force?: boolean }) =>
      GithubService.syncGithubRepository(projectId, repoUrl, force),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['github', 'telemetry', variables.projectId, variables.repoUrl], data);
      queryClient.invalidateQueries({ queryKey: githubKeys.project(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: githubKeys.summary(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: ['github', 'all-repositories'] });
    },
  });
};

export const useSyncRepository = useSyncGithubRepository;
export const useConnectRepository = useSyncGithubRepository;
export const useUpdateRepository = useSyncGithubRepository;
