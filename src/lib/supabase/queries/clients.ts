import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../../services/client.service';
import { type ClientQueryOptions } from '../../repositories/client.repository';
import { sanitizeClientData, type ClientFormData } from '../../validators/client-schema';

/**
 * Centralized Query Keys Factory
 */
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ClientQueryOptions) => [...clientKeys.lists(), filters] as const,
  counts: () => [...clientKeys.all, 'counts'] as const,
  countries: () => [...clientKeys.all, 'countries'] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  stats360: (id: string) => [...clientKeys.all, 'stats360', id] as const,
  expanded: (id: string) => [...clientKeys.all, 'expanded', id] as const,
  statistics: (id?: string) => [...clientKeys.all, 'statistics', id || 'global'] as const,
  projects: (id: string) => [...clientKeys.all, 'projects', id] as const,
  timeline: (id: string) => [...clientKeys.all, 'timeline', id] as const,
  documents: (id: string) => [...clientKeys.all, 'documents', id] as const,
  shareLinks: (id: string) => [...clientKeys.all, 'shareLinks', id] as const,
  deployments: (id: string) => [...clientKeys.all, 'deployments', id] as const,
  github: (id: string) => [...clientKeys.all, 'github', id] as const,
  activity: (id: string) => [...clientKeys.all, 'activity', id] as const,
};

/**
 * Fetch Paginated Client Directory
 */
export const useClients = (options: ClientQueryOptions = {}) => {
  return useQuery({
    queryKey: clientKeys.list(options),
    queryFn: () => clientService.getClientsList(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Fetch Workspace Client Statistics Summary KPI Counts
 */
export const useClientCounts = () => {
  return useQuery({
    queryKey: clientKeys.counts(),
    queryFn: () => clientService.getWorkspaceClientCounts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch Distinct Client Countries List for Filter Dropdown
 */
export const useClientCountries = () => {
  return useQuery({
    queryKey: clientKeys.countries(),
    queryFn: () => clientService.getClientCountries(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch Lazy-Loaded Expanded Row Details
 */
export const useClientExpandedDetails = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.expanded(clientId),
    queryFn: () => clientService.getClientExpandedDetails(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Single Client Profile Detail
 */
export const useClientDetails = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.getClientById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Alias for useClientDetails
 */
export const useClient = useClientDetails;

/**
 * Fetch Client 360 Degree Statistics Metrics (10 Compact Cards)
 */
export const useClient360Statistics = (clientId: string) => {
  return useQuery({
    queryKey: clientKeys.stats360(clientId),
    queryFn: () => clientService.getClient360Statistics(clientId),
    enabled: Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Assigned Projects Portfolio
 */
export const useClientProjects = (clientId: string, enabled = true) => {
  return useQuery({
    queryKey: clientKeys.projects(clientId),
    queryFn: () => clientService.getClientProjects(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Timeline Events (Lazy Loaded per Tab)
 */
export const useClientTimeline = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.timeline(clientId),
    queryFn: () => clientService.getClientTimeline(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Documentation Items (Lazy Loaded per Tab)
 */
export const useClientDocuments = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.documents(clientId),
    queryFn: () => clientService.getClientDocuments(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Share Links (Lazy Loaded per Tab)
 */
export const useClientShareLinks = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.shareLinks(clientId),
    queryFn: () => clientService.getClientShareLinks(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Deployments (Lazy Loaded per Tab)
 */
export const useClientDeployments = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.deployments(clientId),
    queryFn: () => clientService.getClientDeployments(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client GitHub Repositories (Lazy Loaded per Tab)
 */
export const useClientGithub = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.github(clientId),
    queryFn: () => clientService.getClientGithub(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Unified Client Activity Log (Lazy Loaded per Tab)
 */
export const useClientActivity = (clientId: string, enabled = false) => {
  return useQuery({
    queryKey: clientKeys.activity(clientId),
    queryFn: () => clientService.getClientActivity(clientId),
    enabled: enabled && Boolean(clientId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch Client Basic Statistics Metrics
 */
export const useClientStatistics = (clientId: string) => {
  return useQuery({
    queryKey: clientKeys.statistics(clientId),
    queryFn: () => clientService.getClientStatistics(clientId),
    enabled: Boolean(clientId),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Create New Client Mutation
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ClientFormData>) => {
      const sanitized = sanitizeClientData(data);
      return clientService.createClient(sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};

/**
 * Update Client Mutation
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      const sanitized = sanitizeClientData(data);
      return clientService.updateClient(id, sanitized);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
  });
};

/**
 * Delete Client Mutation
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return clientService.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
};
