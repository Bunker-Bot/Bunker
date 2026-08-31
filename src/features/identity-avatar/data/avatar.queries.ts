import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AvatarService } from './avatar.service';
import type { BunkerAvatarConfig, GuardianAvatarDTO, AvatarStudioFilter } from '../types/avatar.types';

export const avatarKeys = {
  all: ['guardian-avatars'] as const,
  lists: () => [...avatarKeys.all, 'list'] as const,
  list: (filters?: { search?: string; filter?: AvatarStudioFilter }) =>
    [...avatarKeys.lists(), filters] as const,
  details: () => [...avatarKeys.all, 'detail'] as const,
  detail: (idOrCode: string) => [...avatarKeys.details(), idOrCode] as const,
};

export function useGuardianAvatars(options?: {
  search?: string;
  filter?: AvatarStudioFilter;
}) {
  return useQuery({
    queryKey: avatarKeys.list(options),
    queryFn: () => AvatarService.listAvatars(options),
  });
}

export function useGuardianAvatar(idOrCode: string | null | undefined) {
  return useQuery({
    queryKey: avatarKeys.detail(idOrCode || ''),
    queryFn: () => (idOrCode ? AvatarService.getAvatar(idOrCode) : null),
    enabled: Boolean(idOrCode),
  });
}

export function useCreateGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      config?: BunkerAvatarConfig;
      projectId?: string | null;
    }) => AvatarService.createAvatar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; config?: BunkerAvatarConfig };
    }) => AvatarService.updateAvatar(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.setQueryData(avatarKeys.detail(updated.id), updated);
      queryClient.setQueryData(avatarKeys.detail(updated.avatarCode), updated);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAssignGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      avatarId,
      projectId,
    }: {
      avatarId: string;
      projectId: string;
    }) => AvatarService.assignToProject(avatarId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUnassignGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      avatarId,
      currentProjectId,
    }: {
      avatarId: string;
      currentProjectId?: string | null;
    }) => AvatarService.unassign(avatarId, currentProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useResetGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar: GuardianAvatarDTO) => AvatarService.resetToDefault(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDuplicateGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar: GuardianAvatarDTO) => AvatarService.duplicate(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
    },
  });
}

export function useDeleteGuardianAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatarId: string) => AvatarService.deleteAvatar(avatarId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
