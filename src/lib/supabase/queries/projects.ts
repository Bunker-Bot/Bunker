import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '../../services/project.service';
import { type ProjectQueryOptions } from '../../repositories/project.repository';
import { ClientRepository } from '../../repositories/client.repository';

/**
 * Centralized Project Query Keys Factory
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectQueryOptions) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  sections: (id: string) => [...projectKeys.all, 'sections', id] as const,
  overview: (id: string) => [...projectKeys.all, 'overview', id] as const,
  statistics: () => [...projectKeys.all, 'statistics'] as const,
  counts: () => [...projectKeys.all, 'counts'] as const,
  clientsSelect: () => ['clients', 'select-options'] as const,
};

/**
 * Default React Query Configuration
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,    // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
};

/**
 * Fetch Paginated Projects Directory
 */
export const useProjects = (options: ProjectQueryOptions = {}) => {
  return useQuery({
    queryKey: projectKeys.list(options),
    queryFn: () => ProjectService.getProjectsList(options),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Single Project Detail by Slug
 */
export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => ProjectService.getProjectBySlug(slug),
    enabled: Boolean(slug),
    ...DEFAULT_QUERY_CONFIG,
  });
};

export const useProject = useProjectBySlug;

/**
 * Fetch Project Overview Specification
 */
export const useProjectOverview = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.overview(projectId),
    queryFn: () => ProjectService.getOverview(projectId),
    enabled: Boolean(projectId),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Project Counts Metrics
 */
export const useProjectCounts = () => {
  return useQuery({
    queryKey: projectKeys.counts(),
    queryFn: () => ProjectService.getProjectCounts(),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Clients List for Form Dropdowns
 */
export const useClientsForSelect = (enabled = true) => {
  return useQuery({
    queryKey: projectKeys.clientsSelect(),
    queryFn: async () => {
      const res = await ClientRepository.getClients({ limit: 100 });
      return res.clients.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.company})`,
      }));
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch Workspace Activity Logs
 */
export const useWorkspaceActivity = () => {
  return useQuery({
    queryKey: ['workspace', 'activity'],
    queryFn: () => ProjectService.getWorkspaceActivity(),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Fetch Workspace Storage Usage
 */
export const useWorkspaceStorage = () => {
  return useQuery({
    queryKey: ['workspace', 'storage'],
    queryFn: () => ProjectService.getWorkspaceStorage(),
    ...DEFAULT_QUERY_CONFIG,
  });
};

/**
 * Create New Project Mutation
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ProjectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.counts() });
    },
  });
};

/**
 * Update Project Mutation with Optimistic Cache Updates
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ProjectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

/**
 * Update Section Mutation
 */
export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ProjectService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.sections(variables.id) });
    },
  });
};

/**
 * Archive Project Mutation
 */
export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProjectService.archiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

/**
 * Restore Project Mutation
 */
export const useRestoreProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProjectService.restoreProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
};

/**
 * Delete Project Mutation with Dependency Checks
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const deps = await ProjectService.checkDependencies(id);
      if (deps.hasDependencies) {
        throw new Error(
          `This project contains ${deps.tasksCount} related tasks and ${deps.milestonesCount} milestones. Delete or archive them first.`
        );
      }
      return await ProjectService.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.counts() });
    },
  });
};
