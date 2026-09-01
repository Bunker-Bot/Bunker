import type { BunkerAvatarConfig } from '../../../features/identity-avatar/types/avatar.types';

export type TeamStatus = 'active' | 'archived';

export type TeamType =
  | 'Engineering'
  | 'Delivery'
  | 'Design'
  | 'Product'
  | 'Operations'
  | 'Cross-functional'
  | 'Custom';

export type TeamRole =
  | 'owner'
  | 'admin'
  | 'project_manager'
  | 'contributor'
  | 'viewer'
  | 'finance_manager';

export type TeamMembershipStatus = 'active' | 'invited' | 'suspended' | 'removed';

export type ProjectMemberRole =
  | 'lead'
  | 'developer'
  | 'designer'
  | 'contributor'
  | 'reviewer'
  | 'viewer';

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  teamType: TeamType | string;
  defaultCurrency: string;
  timezone: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  guardianAvatarId: string | null;
  avatarCode: string | null;
  avatarConfig: BunkerAvatarConfig | null;
  avatarVersion: number;
  status: TeamStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
  projectsCount?: number;
  clientsCount?: number;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  status: TeamMembershipStatus;
  invitedBy: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName?: string | null;
    email: string;
    avatarUrl?: string | null;
  } | null;
}

export interface TeamClient {
  id: string;
  teamId: string;
  clientId: string;
  relationshipType: string;
  assignedBy: string | null;
  assignedAt: string;
  client?: {
    id: string;
    name: string;
    email?: string | null;
    company?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  teamId: string | null;
  userId: string;
  projectRole: ProjectMemberRole;
  assignedBy: string | null;
  assignedAt: string;
  user?: {
    id: string;
    fullName?: string | null;
    email: string;
    avatarUrl?: string | null;
  } | null;
}

export interface TeamFinanceSummary {
  currency: string;
  totalValue: number;
  received: number;
  remaining: number;
}

export interface TeamProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  completionPercent: number;
  color: string;
  avatarCode?: string | null;
  avatarConfig?: BunkerAvatarConfig | null;
  budget: number;
  currency: string;
  createdAt: string;
  clientName?: string | null;
}

export interface TeamOverviewDTO {
  team: Team;
  userRole: TeamRole;
  counts: {
    members: number;
    clients: number;
    projects: number;
    activeProjects: number;
    pendingDeliverables: number;
  };
  timeSummary: {
    weekMinutes: number;
  };
  finance: TeamFinanceSummary[];
  recentProjects: TeamProjectSummary[];
}

export interface TimeEntry {
  id: string;
  userId: string;
  teamId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  durationMinutes: number;
  note?: string | null;
  startedAt: string;
  endedAt?: string | null;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
  projectName?: string | null;
  userName?: string | null;
  userAvatarUrl?: string | null;
}

export interface TeamActivityItem {
  id: string;
  teamId: string;
  action: string;
  description: string;
  actorName: string;
  actorAvatar?: string | null;
  targetType: 'project' | 'member' | 'client' | 'guardian' | 'finance' | 'deliverable' | 'document' | 'github';
  targetTitle?: string | null;
  createdAt: string;
}

export interface CreateTeamInput {
  name: string;
  slug?: string;
  description?: string;
  teamType?: TeamType | string;
  defaultCurrency?: string;
  timezone?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface UpdateTeamInput {
  name?: string;
  slug?: string;
  description?: string | null;
  teamType?: TeamType | string;
  defaultCurrency?: string;
  timezone?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  status?: TeamStatus;
}
