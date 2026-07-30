import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MilestoneRepository } from '../../repositories/milestone.repository';
import type { Milestone } from '../../../types';

export function useMilestones(projectId?: string) {
  return useQuery({
    queryKey: ['milestones', projectId || 'all'],
    queryFn: async () => {
      return await MilestoneRepository.getMilestonesByProject(projectId);
    },
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneData: Partial<Milestone>) => {
      return await MilestoneRepository.createMilestone(milestoneData);
    },
    onSuccess: (data) => {
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['milestones', data.project_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['milestones'] });
      }
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Milestone> }) => {
      return await MilestoneRepository.updateMilestone(id, updates);
    },
    onSuccess: (data) => {
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['milestones', data.project_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['milestones'] });
      }
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId?: string }) => {
      await MilestoneRepository.deleteMilestone(id);
      return { id, projectId };
    },
    onSuccess: (data) => {
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['milestones', data.projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['milestones'] });
      }
    },
  });
}
