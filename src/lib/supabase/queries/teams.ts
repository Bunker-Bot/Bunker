import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../services/team.service';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  TeamRole,
} from '../../../modules/teams/types/team.types';

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  detail: (teamId?: string | null) => [...teamKeys.all, 'detail', teamId] as const,
  overview: (teamId?: string | null) => [...teamKeys.all, 'overview', teamId] as const,
  members: (teamId?: string | null) => [...teamKeys.all, 'members', teamId] as const,
  projects: (teamId?: string | null) => [...teamKeys.all, 'projects', teamId] as const,
  clients: (teamId?: string | null) => [...teamKeys.all, 'clients', teamId] as const,
  finance: (teamId?: string | null) => [...teamKeys.all, 'finance', teamId] as const,
  time: (teamId?: string | null) => [...teamKeys.all, 'time', teamId] as const,
  activity: (teamId?: string | null) => [...teamKeys.all, 'activity', teamId] as const,
};

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => TeamService.fetchTeams(),
    staleTime: 1000 * 30,
  });
}

export function useTeam(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamById(teamId) : null),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamOverview(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.overview(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamOverview(teamId) : null),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamMembers(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamMembers(teamId) : []),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamProjects(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.projects(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamProjects(teamId) : []),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamClients(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.clients(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamClients(teamId) : []),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamFinance(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.finance(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamFinance(teamId) : { currencies: [], projects: [] }),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamTime(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.time(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamTime(teamId) : []),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useTeamActivity(teamId?: string | null) {
  return useQuery({
    queryKey: teamKeys.activity(teamId),
    queryFn: () => (teamId ? TeamService.fetchTeamActivity(teamId) : []),
    enabled: Boolean(teamId),
    staleTime: 1000 * 30,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => TeamService.createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, input }: { teamId: string; input: UpdateTeamInput }) =>
      TeamService.updateTeam(teamId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useArchiveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => TeamService.archiveTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
    },
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, email, role }: { teamId: string; email: string; role?: TeamRole }) =>
      TeamService.inviteTeamMember(teamId, email, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId: _teamId, membershipId, role }: { teamId: string; membershipId: string; role: TeamRole }) =>
      TeamService.updateMemberRole(membershipId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId: _teamId, membershipId }: { teamId: string; membershipId: string }) =>
      TeamService.removeMember(membershipId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useAssignProjectToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, teamId }: { projectId: string; teamId: string | null }) =>
      TeamService.assignProjectToTeam(projectId, teamId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.projects(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAssignClientToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, clientId }: { teamId: string; clientId: string }) =>
      TeamService.assignClientToTeam(teamId, clientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.clients(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useRemoveClientFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId: _teamId, clientId }: { teamId: string; clientId: string }) =>
      TeamService.removeClientFromTeam(_teamId, clientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.clients(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}

export function useLogTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      teamId: string;
      projectId?: string;
      durationMinutes: number;
      note?: string;
      startedAt?: string;
      billable?: boolean;
    }) => TeamService.logTimeEntry(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.time(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.overview(variables.teamId) });
    },
  });
}
