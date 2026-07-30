import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import { requestQueue } from '../../utils/request-queue';
import type {
  ChangelogEntry,
  CreateChangelogInput,
  UpdateChangelogInput,
} from '../../../modules/changelog/types/changelog';
import type {
  NoteEntry,
  CreateNoteInput,
  UpdateNoteInput,
  NoteFilters,
} from '../../../modules/notes/types/notes';
import type {
  DeploymentEntry,
  CreateDeploymentInput,
  UpdateDeploymentInput,
  DeploymentEnvironment,
} from '../../../modules/deployments/types/deployments';

// Helper: Friendly error converter
function mapAppError(err: unknown): Error {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('duplicate key') || msg.includes('idx_changelog_project_version')) {
      return new Error('A release entry with this version already exists for this project.');
    }
    if (msg.includes('permission denied')) {
      return new Error('You do not have permission to modify these records.');
    }
    if (msg.includes('fetch') || msg.includes('network')) {
      return new Error('Network error. Please check your connection and try again.');
    }
    return new Error(err.message);
  }
  return new Error('An unexpected operation failure occurred.');
}

// ==========================================
// 1. CHANGELOG MODULE QUERY & MUTATION HOOKS
// ==========================================

function mapChangelogRow(row: {
  id: string;
  project_id: string;
  version: string;
  title: string | null;
  description: string | null;
  released_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}): ChangelogEntry {
  return {
    id: row.id,
    projectId: row.project_id,
    version: row.version || 'v1.0.0',
    title: row.title || 'Release',
    description: row.description || '',
    releasedAt: row.released_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function useChangelog(projectId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || projectId === 'all') return;
    const channelId = Math.random().toString(36).substring(2, 7);
    const channel = supabase
      .channel(`changelog_realtime_${projectId}_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'changelog_entries', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['changelog', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return useQuery<ChangelogEntry[], Error>({
    queryKey: ['changelog', projectId],
    queryFn: async () => {
      return requestQueue.enqueue(async () => {
        let query = supabase
          .from('changelog_entries')
          .select('id, project_id, version, title, description, released_at, created_at, updated_at')
          .order('released_at', { ascending: false });

        if (projectId && projectId !== 'all') {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw mapAppError(error);
        return (data || []).map(mapChangelogRow);
      }, 'low');
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreateChangelogEntry() {
  const queryClient = useQueryClient();

  return useMutation<ChangelogEntry, Error, CreateChangelogInput>({
    mutationFn: async (input) => {
      return requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('changelog_entries')
          .insert({
            project_id: input.projectId,
            version: input.version,
            title: input.title,
            description: input.description,
            released_at: input.releasedAt || new Date().toISOString(),
          })
          .select('id, project_id, version, title, description, released_at, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapChangelogRow(data);
      }, 'high');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['changelog', 'all'] });
    },
  });
}

export function useUpdateChangelogEntry() {
  const queryClient = useQueryClient();

  return useMutation<ChangelogEntry, Error, UpdateChangelogInput>({
    mutationFn: async (input) => {
      return requestQueue.enqueue(async () => {
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (input.version !== undefined) updates.version = input.version;
        if (input.title !== undefined) updates.title = input.title;
        if (input.description !== undefined) updates.description = input.description;
        if (input.releasedAt !== undefined) updates.released_at = input.releasedAt;

        const { data, error } = await supabase
          .from('changelog_entries')
          .update(updates)
          .eq('id', input.id)
          .select('id, project_id, version, title, description, released_at, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapChangelogRow(data);
      }, 'high');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changelog', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['changelog', 'all'] });
    },
  });
}

export function useChangelogStats(projectId?: string | null) {
  const { data: entries = [] } = useChangelog(projectId);

  const totalReleases = entries.length;
  const latestVersion = entries.length > 0 ? entries[0].version : 'v0.0.0';
  const majorReleases = entries.filter(
    (e) => e.version.includes('.0.0') || e.version.startsWith('v1.0.0') || e.version.startsWith('v2.0.0')
  ).length;
  const lastReleasedAt = entries.length > 0 ? entries[0].releasedAt : null;

  return {
    totalReleases,
    latestVersion,
    majorReleases,
    lastReleasedAt,
  };
}

export function useCheckVersionExists(projectId: string, version: string, excludeId?: string) {
  return useQuery<boolean>({
    queryKey: ['changelog-check-version', projectId, version, excludeId],
    queryFn: async () => {
      if (!projectId || !version.trim()) return false;
      const { data } = await supabase
        .from('changelog_entries')
        .select('id')
        .eq('project_id', projectId)
        .eq('version', version.trim());

      if (!data) return false;
      if (excludeId) {
        return data.some((r) => r.id !== excludeId);
      }
      return data.length > 0;
    },
    enabled: Boolean(projectId && version.trim().length > 0),
    staleTime: 1000 * 5,
  });
}

export function useDeleteChangelogEntry() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      return requestQueue.enqueue(async () => {
        const { error } = await supabase.from('changelog_entries').delete().eq('id', id);
        if (error) throw mapAppError(error);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
    },
  });
}

// Aliases for backward compatibility
export const useCreateChangelog = useCreateChangelogEntry;
export const useUpdateChangelog = useUpdateChangelogEntry;
export const useDeleteChangelog = useDeleteChangelogEntry;

// ===================================
// 2. NOTES MODULE QUERY & MUTATION HOOKS
// ===================================

function mapNoteRow(row: any): NoteEntry {
  return {
    id: String(row.id),
    projectId: row.project_id ? String(row.project_id) : null,
    clientId: row.client_id ? String(row.client_id) : null,
    title: row.title || 'Untitled Note',
    content: row.content || '',
    tags: Array.isArray(row.tags) ? row.tags : ['General'],
    isPinned: Boolean(row.is_pinned),
    isArchived: Boolean(row.is_archived),
    createdBy: row.created_by || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    projectName: row.projects?.name,
    clientName: row.clients?.name,
  };
}

export function useNotes(filters: NoteFilters = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(2, 7);
    const channel = supabase
      .channel(`notes_realtime_${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<NoteEntry[], Error>({
    queryKey: ['notes', filters],
    queryFn: async () => {
      return requestQueue.enqueue(async () => {
        const {
          projectId,
          clientId,
          search,
          tag,
          isPinnedOnly,
          isArchivedOnly = false,
          sortBy = 'created_at',
          sortOrder = 'desc',
        } = filters;

        let query = supabase
          .from('notes')
          .select(
            'id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at, projects(id, name), clients(id, name)'
          )
          .eq('is_archived', isArchivedOnly)
          .order('is_pinned', { ascending: false })
          .order(sortBy, { ascending: sortOrder === 'asc' });

        if (projectId && projectId !== 'all') {
          query = query.eq('project_id', projectId);
        }

        if (clientId && clientId !== 'all') {
          query = query.eq('client_id', clientId);
        }

        if (isPinnedOnly) {
          query = query.eq('is_pinned', true);
        }

        if (tag && tag !== 'all') {
          query = query.contains('tags', [tag]);
        }

        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw mapAppError(error);
        return (data || []).map(mapNoteRow);
      }, 'low');
    },
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<NoteEntry, Error, CreateNoteInput>({
    mutationFn: async (input) => {
      return requestQueue.enqueue(async () => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';

        const { data, error } = await supabase
          .from('notes')
          .insert({
            project_id: input.projectId || null,
            client_id: input.clientId || null,
            title: input.title || 'Untitled Note',
            content: input.content,
            tags: input.tags || ['General'],
            is_pinned: input.isPinned ?? false,
            created_by: userId,
          })
          .select('id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapNoteRow(data);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation<NoteEntry, Error, UpdateNoteInput>({
    mutationFn: async (input) => {
      return requestQueue.enqueue(async () => {
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (input.title !== undefined) updates.title = input.title;
        if (input.content !== undefined) updates.content = input.content;
        if (input.tags !== undefined) updates.tags = input.tags;
        if (input.isPinned !== undefined) updates.is_pinned = input.isPinned;
        if (input.isArchived !== undefined) updates.is_archived = input.isArchived;
        if (input.projectId !== undefined) updates.project_id = input.projectId;
        if (input.clientId !== undefined) updates.client_id = input.clientId;

        const { data, error } = await supabase
          .from('notes')
          .update(updates)
          .eq('id', input.id)
          .select('id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapNoteRow(data);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return requestQueue.enqueue(async () => {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw mapAppError(error);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation<NoteEntry, Error, { id: string; isPinned: boolean }>({
    mutationFn: async ({ id, isPinned }) => {
      return requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('notes')
          .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapNoteRow(data);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation<NoteEntry, Error, { id: string; isArchived: boolean }>({
    mutationFn: async ({ id, isArchived }) => {
      return requestQueue.enqueue(async () => {
        const { data, error } = await supabase
          .from('notes')
          .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at')
          .single();

        if (error) throw mapAppError(error);
        return mapNoteRow(data);
      }, 'high');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Alias backward compatibility
export const useTogglePinNote = usePinNote;
export const useToggleArchiveNote = useArchiveNote;

// =========================================
// 3. DEPLOYMENTS MODULE QUERY & MUTATION HOOKS
// =========================================

function mapDeploymentRow(row: any): DeploymentEntry {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    environment: row.environment || 'production',
    frontendUrl: row.frontend_url || null,
    backendUrl: row.backend_url || null,
    apiUrl: row.api_url || null,
    adminUrl: row.admin_url || null,
    portalUrl: row.portal_url || null,
    status: row.status || 'successful',
    version: row.version || 'v1.0.0',
    notes: row.notes || null,
    deployedAt: row.deployed_at || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    projectName: row.projects?.name,
  };
}

export function useDeployments(projectId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || projectId === 'all') return;
    const channelId = Math.random().toString(36).substring(2, 7);
    const channel = supabase
      .channel(`deployments_realtime_${projectId}_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deployments', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['deployments', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return useQuery<DeploymentEntry[], Error>({
    queryKey: ['deployments', projectId],
    queryFn: async () => {
      return requestQueue.enqueue(async () => {
        let query = supabase
          .from('deployments')
          .select(
            'id, project_id, environment, frontend_url, backend_url, api_url, admin_url, portal_url, status, version, notes, deployed_at, created_at, updated_at, projects(id, name)'
          )
          .order('deployed_at', { ascending: false });

        if (projectId && projectId !== 'all') {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw mapAppError(error);
        return (data || []).map(mapDeploymentRow);
      }, 'low');
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useDeployment(environment: DeploymentEnvironment, projectId?: string | null) {
  const { data: deployments = [] } = useDeployments(projectId);
  return deployments.find((d) => d.environment === environment) || null;
}

export function useUpsertDeployment() {
  const queryClient = useQueryClient();

  return useMutation<DeploymentEntry, Error, CreateDeploymentInput & { id?: string }>({
    mutationFn: async (input) => {
      return requestQueue.enqueue(async () => {
        if (input.id) {
          const { data, error } = await supabase
            .from('deployments')
            .update({
              environment: input.environment,
              frontend_url: input.frontendUrl || null,
              backend_url: input.backendUrl || null,
              api_url: input.apiUrl || null,
              admin_url: input.adminUrl || null,
              portal_url: input.portalUrl || null,
              status: input.status || 'successful',
              version: input.version || 'v1.0.0',
              notes: input.notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.id)
            .select('id, project_id, environment, frontend_url, backend_url, api_url, admin_url, portal_url, status, version, notes, deployed_at, created_at, updated_at')
            .single();

          if (error) throw mapAppError(error);
          return mapDeploymentRow(data);
        } else {
          const { data, error } = await supabase
            .from('deployments')
            .insert({
              project_id: input.projectId,
              environment: input.environment,
              frontend_url: input.frontendUrl || null,
              backend_url: input.backendUrl || null,
              api_url: input.apiUrl || null,
              admin_url: input.adminUrl || null,
              portal_url: input.portalUrl || null,
              status: input.status || 'successful',
              version: input.version || 'v1.0.0',
              notes: input.notes || null,
              deployed_at: new Date().toISOString(),
            })
            .select('id, project_id, environment, frontend_url, backend_url, api_url, admin_url, portal_url, status, version, notes, deployed_at, created_at, updated_at')
            .single();

          if (error) throw mapAppError(error);
          return mapDeploymentRow(data);
        }
      }, 'high');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['deployments', 'all'] });
    },
  });
}

export function useCreateDeployment() {
  const upsert = useUpsertDeployment();
  return useMutation({
    mutationFn: (input: CreateDeploymentInput) => upsert.mutateAsync(input),
  });
}

export function useUpdateDeployment() {
  const upsert = useUpsertDeployment();
  return useMutation({
    mutationFn: (input: UpdateDeploymentInput) =>
      upsert.mutateAsync({
        ...input,
        projectId: input.projectId,
        environment: input.environment || 'production',
      }),
  });
}

export function useDeleteDeployment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; projectId?: string }>({
    mutationFn: async ({ id }) => {
      return requestQueue.enqueue(async () => {
        const { error } = await supabase.from('deployments').delete().eq('id', id);
        if (error) throw mapAppError(error);
      }, 'high');
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['deployments', variables.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['deployments', 'all'] });
    },
  });
}
