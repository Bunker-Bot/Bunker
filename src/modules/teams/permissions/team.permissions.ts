import type { TeamRole } from '../types/team.types';

export type TeamCapability =
  | 'team.manage'
  | 'team.delete'
  | 'team.members.manage'
  | 'team.identity.manage'
  | 'team.finance.view'
  | 'team.finance.manage'
  | 'project.create'
  | 'project.manage'
  | 'project.members.manage'
  | 'documents.write'
  | 'time.track'
  | 'time.manage'
  | 'github.view';

const ROLE_CAPABILITY_MAP: Record<TeamRole, TeamCapability[]> = {
  owner: [
    'team.manage',
    'team.delete',
    'team.members.manage',
    'team.identity.manage',
    'team.finance.view',
    'team.finance.manage',
    'project.create',
    'project.manage',
    'project.members.manage',
    'documents.write',
    'time.track',
    'time.manage',
    'github.view',
  ],
  admin: [
    'team.manage',
    'team.members.manage',
    'team.identity.manage',
    'team.finance.view',
    'team.finance.manage',
    'project.create',
    'project.manage',
    'project.members.manage',
    'documents.write',
    'time.track',
    'time.manage',
    'github.view',
  ],
  project_manager: [
    'team.identity.manage',
    'team.finance.view',
    'project.create',
    'project.manage',
    'project.members.manage',
    'documents.write',
    'time.track',
    'time.manage',
    'github.view',
  ],
  finance_manager: [
    'team.finance.view',
    'team.finance.manage',
    'documents.write',
    'time.track',
    'github.view',
  ],
  contributor: [
    'project.create',
    'documents.write',
    'time.track',
    'github.view',
  ],
  viewer: [
    'github.view',
  ],
};

export function hasTeamCapability(role: TeamRole | string | undefined | null, capability: TeamCapability): boolean {
  if (!role) return false;
  const capabilities = ROLE_CAPABILITY_MAP[role as TeamRole];
  if (!capabilities) return false;
  return capabilities.includes(capability);
}

export function canManageMembers(role: TeamRole | string | undefined | null): boolean {
  return hasTeamCapability(role, 'team.members.manage');
}

export function canViewFinance(role: TeamRole | string | undefined | null): boolean {
  return hasTeamCapability(role, 'team.finance.view');
}

export function canManageFinance(role: TeamRole | string | undefined | null): boolean {
  return hasTeamCapability(role, 'team.finance.manage');
}

export function canManageTeamIdentity(role: TeamRole | string | undefined | null): boolean {
  return hasTeamCapability(role, 'team.identity.manage');
}
