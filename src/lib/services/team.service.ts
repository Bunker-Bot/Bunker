import { supabase } from '../supabase/client';
import { generateAvatarConfig } from '../../features/identity-avatar/lib/avatar-generator';
import type {
  Team,
  TeamMembership,
  TeamClient,
  TeamOverviewDTO,
  TeamFinanceSummary,
  TimeEntry,
  TeamActivityItem,
  CreateTeamInput,
  UpdateTeamInput,
  TeamRole,
} from '../../modules/teams/types/team.types';

function mapRowToTeam(row: any): Team {
  return {
    id: String(row.id),
    name: row.name,
    slug: row.slug,
    description: row.description || null,
    teamType: row.team_type || 'Engineering',
    defaultCurrency: row.default_currency || 'INR',
    timezone: row.timezone || 'UTC',
    primaryColor: row.primary_color || '#06B6D4',
    secondaryColor: row.secondary_color || '#8B5CF6',
    accentColor: row.accent_color || '#10B981',
    guardianAvatarId: row.guardian_avatar_id || null,
    avatarCode: row.avatar_code || null,
    avatarConfig: row.avatar_config || null,
    avatarVersion: row.avatar_version || 1,
    status: row.status || 'active',
    createdBy: row.created_by || null,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export class TeamService {
  /**
   * Fetch all teams accessible to the current user
   */
  static async fetchTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_memberships(count), projects:projects(count), clients:team_clients(count)')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        ...mapRowToTeam(row),
        membersCount: row.members?.[0]?.count || 1,
        projectsCount: row.projects?.[0]?.count || 0,
        clientsCount: row.clients?.[0]?.count || 0,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch a single team by ID or slug
   */
  static async fetchTeamById(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .or(`id.eq.${teamId},slug.eq.${teamId}`)
        .maybeSingle();

      if (error || !data) return null;
      return mapRowToTeam(data);
    } catch {
      return null;
    }
  }

  /**
   * Create a new Team, with automatic Team Guardian assignment and owner membership
   */
  static async createTeam(input: CreateTeamInput): Promise<Team> {
    const slug = (
      input.slug ||
      input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    ) + '-' + Math.random().toString(36).substring(2, 6);

    const initialAvatarConfig = generateAvatarConfig({
      entityId: slug,
      entityKind: 'team',
      name: input.name,
      preferredColor: input.primaryColor || '#06B6D4',
    });

    const { data: userAuth } = await supabase.auth.getUser();
    const userId = userAuth?.user?.id;

    // Generate random 10-digit code
    const avatarCode = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        team_type: input.teamType || 'Engineering',
        default_currency: input.defaultCurrency || 'INR',
        timezone: input.timezone || 'UTC',
        primary_color: input.primaryColor || '#06B6D4',
        secondary_color: input.secondaryColor || '#8B5CF6',
        accent_color: input.accentColor || '#10B981',
        avatar_code: avatarCode,
        avatar_config: initialAvatarConfig,
        avatar_version: 1,
        status: 'active',
        created_by: userId || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapRowToTeam(data);
  }

  /**
   * Update team settings
   */
  static async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.slug !== undefined) payload.slug = input.slug.trim();
    if (input.description !== undefined) payload.description = input.description;
    if (input.teamType !== undefined) payload.team_type = input.teamType;
    if (input.defaultCurrency !== undefined) payload.default_currency = input.defaultCurrency;
    if (input.timezone !== undefined) payload.timezone = input.timezone;
    if (input.primaryColor !== undefined) payload.primary_color = input.primaryColor;
    if (input.secondaryColor !== undefined) payload.secondary_color = input.secondaryColor;
    if (input.accentColor !== undefined) payload.accent_color = input.accentColor;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', teamId)
      .select('*')
      .single();

    if (error) throw error;
    return mapRowToTeam(data);
  }

  /**
   * Archive Team
   */
  static async archiveTeam(teamId: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', teamId);

    if (error) throw error;
  }

  /**
   * Fetch Team Overview with security RPC
   */
  static async fetchTeamOverview(teamId: string): Promise<TeamOverviewDTO | null> {
    try {
      const { data, error } = await supabase.rpc('get_team_overview', { p_team_id: teamId });
      if (!error && data && !data.error) {
        return {
          team: mapRowToTeam(data.team),
          userRole: data.user_role || 'viewer',
          counts: {
            members: Number(data.counts?.members || 0),
            clients: Number(data.counts?.clients || 0),
            projects: Number(data.counts?.projects || 0),
            activeProjects: Number(data.counts?.active_projects || 0),
            pendingDeliverables: Number(data.counts?.pending_deliverables || 0),
          },
          timeSummary: {
            weekMinutes: Number(data.time_summary?.week_minutes || 0),
          },
          finance: (data.finance || []).map((f: any) => ({
            currency: f.currency || 'INR',
            totalValue: Number(f.total_value || 0),
            received: Number(f.received || 0),
            remaining: Number(f.remaining || 0),
          })),
          recentProjects: (data.recent_projects || []).map((rp: any) => ({
            id: String(rp.id),
            name: rp.name,
            slug: rp.slug,
            status: rp.status,
            completionPercent: Number(rp.completion_percent || 0),
            color: rp.color || '#06B6D4',
            avatarCode: rp.avatar_code || null,
            budget: Number(rp.budget || 0),
            currency: rp.currency || 'INR',
            createdAt: rp.created_at,
          })),
        };
      }
    } catch {}

    // Fallback if RPC not available
    const team = await this.fetchTeamById(teamId);
    if (!team) return null;

    return {
      team,
      userRole: 'owner',
      counts: { members: 1, clients: 0, projects: 0, activeProjects: 0, pendingDeliverables: 0 },
      timeSummary: { weekMinutes: 0 },
      finance: [],
      recentProjects: [],
    };
  }

  /**
   * Fetch Team Members
   */
  static async fetchTeamMembers(teamId: string): Promise<TeamMembership[]> {
    try {
      const { data, error } = await supabase
        .from('team_memberships')
        .select('*, user:profiles(id, full_name, email, avatar_url)')
        .eq('team_id', teamId)
        .order('role', { ascending: true });

      if (error || !data) return [];
      return data.map((m: any) => ({
        id: String(m.id),
        teamId: String(m.team_id),
        userId: String(m.user_id),
        role: m.role,
        status: m.status,
        invitedBy: m.invited_by || null,
        joinedAt: m.joined_at || null,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        user: m.user ? {
          id: m.user.id,
          fullName: m.user.full_name,
          email: m.user.email,
          avatarUrl: m.user.avatar_url,
        } : null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Invite a new member to the team
   */
  static async inviteTeamMember(teamId: string, email: string, role: TeamRole = 'contributor'): Promise<void> {
    const token = Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    const { error } = await supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email: email.trim().toLowerCase(),
        role,
        token,
        status: 'pending',
      });

    if (error) throw error;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(membershipId: string, role: TeamRole): Promise<void> {
    const { error } = await supabase
      .from('team_memberships')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', membershipId);

    if (error) throw error;
  }

  /**
   * Remove member from team
   */
  static async removeMember(membershipId: string): Promise<void> {
    const { error } = await supabase
      .from('team_memberships')
      .delete()
      .eq('id', membershipId);

    if (error) throw error;
  }

  /**
   * Fetch projects belonging to the team
   */
  static async fetchTeamProjects(teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, client:clients(id, name, company), payments:project_payments(amount, is_verified), deliverables:delivery_assets(id, is_manual_unlocked)')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((p: any) => {
        const verifiedPayments = (p.payments || []).filter((pay: any) => pay.is_verified !== false);
        const received = verifiedPayments.reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0);
        const budget = Number(p.budget || 0);
        const remaining = Math.max(0, budget - received);

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          status: p.status,
          priority: p.priority,
          deadline: p.deadline,
          completionPercent: p.completion_percent || 0,
          color: p.color || '#06B6D4',
          avatarCode: p.avatar_code,
          avatarConfig: p.avatar_config,
          budget,
          currency: p.currency || 'INR',
          received,
          remaining,
          client: p.client || null,
          deliverablesCount: (p.deliverables || []).length,
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Assign an existing project to a team
   */
  static async assignProjectToTeam(projectId: string, teamId: string | null): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ team_id: teamId, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) throw error;
  }

  /**
   * Fetch clients associated with a team
   */
  static async fetchTeamClients(teamId: string): Promise<TeamClient[]> {
    try {
      const { data, error } = await supabase
        .from('team_clients')
        .select('*, client:clients(*)')
        .eq('team_id', teamId);

      if (error || !data) return [];
      return data.map((tc: any) => ({
        id: String(tc.id),
        teamId: String(tc.team_id),
        clientId: String(tc.client_id),
        relationshipType: tc.relationship_type || 'primary',
        assignedBy: tc.assigned_by || null,
        assignedAt: tc.assigned_at,
        client: tc.client || null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Assign a client to a team
   */
  static async assignClientToTeam(teamId: string, clientId: string): Promise<void> {
    const { error } = await supabase
      .from('team_clients')
      .insert({
        team_id: teamId,
        client_id: clientId,
        relationship_type: 'primary',
      })
      .select('*');

    if (error && !error.message?.includes('duplicate')) throw error;
  }

  /**
   * Remove client association from team
   */
  static async removeClientFromTeam(teamId: string, clientId: string): Promise<void> {
    const { error } = await supabase
      .from('team_clients')
      .delete()
      .eq('team_id', teamId)
      .eq('client_id', clientId);

    if (error) throw error;
  }

  /**
   * Fetch Financial Breakdown for the Team
   */
  static async fetchTeamFinance(teamId: string): Promise<{ currencies: TeamFinanceSummary[]; projects: any[] }> {
    try {
      const { data, error } = await supabase.rpc('get_team_financial_summary', { p_team_id: teamId });
      if (!error && data && !data.error) {
        return {
          currencies: (data.currencies || []).map((c: any) => ({
            currency: c.currency || 'INR',
            totalValue: Number(c.total_value || 0),
            received: Number(c.received || 0),
            remaining: Number(c.remaining || 0),
          })),
          projects: (data.projects || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            status: p.status,
            currency: p.currency || 'INR',
            budget: Number(p.budget || 0),
            received: Number(p.received || 0),
            remaining: Number(p.remaining || 0),
          })),
        };
      }
    } catch {}

    return { currencies: [], projects: [] };
  }

  /**
   * Fetch Time Entries for the Team
   */
  static async fetchTeamTime(teamId: string): Promise<TimeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, project:projects(name), user:profiles(full_name, avatar_url)')
        .eq('team_id', teamId)
        .order('started_at', { ascending: false });

      if (error || !data) return [];
      return data.map((t: any) => ({
        id: String(t.id),
        userId: String(t.user_id),
        teamId: t.team_id || null,
        projectId: t.project_id || null,
        taskId: t.task_id || null,
        durationMinutes: Number(t.duration_minutes || 0),
        note: t.note || null,
        startedAt: t.started_at,
        endedAt: t.ended_at || null,
        billable: Boolean(t.billable),
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        projectName: t.project?.name || null,
        userName: t.user?.full_name || null,
        userAvatarUrl: t.user?.avatar_url || null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Log time entry
   */
  static async logTimeEntry(input: {
    teamId: string;
    projectId?: string;
    durationMinutes: number;
    note?: string;
    startedAt?: string;
    billable?: boolean;
  }): Promise<TimeEntry> {
    const { data: userAuth } = await supabase.auth.getUser();
    const userId = userAuth?.user?.id;
    if (!userId) throw new Error('AUTH_REQUIRED');

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        team_id: input.teamId,
        project_id: input.projectId || null,
        duration_minutes: input.durationMinutes,
        note: input.note?.trim() || null,
        started_at: input.startedAt || new Date().toISOString(),
        billable: input.billable ?? true,
      })
      .select('*, project:projects(name), user:profiles(full_name, avatar_url)')
      .single();

    if (error) throw error;
    return {
      id: String(data.id),
      userId: String(data.user_id),
      teamId: data.team_id || null,
      projectId: data.project_id || null,
      taskId: data.task_id || null,
      durationMinutes: Number(data.duration_minutes || 0),
      note: data.note || null,
      startedAt: data.started_at,
      endedAt: data.ended_at || null,
      billable: Boolean(data.billable),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      projectName: data.project?.name || null,
      userName: data.user?.full_name || null,
      userAvatarUrl: data.user?.avatar_url || null,
    };
  }

  /**
   * Fetch Team Activity
   */
  static async fetchTeamActivity(teamId: string): Promise<TeamActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('entity_type', 'team')
        .eq('entity_id', teamId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((a: any) => ({
          id: String(a.id),
          teamId,
          action: a.action,
          description: a.description || a.details?.message || 'Activity updated',
          actorName: a.actor_name || 'Team Member',
          actorAvatar: a.actor_avatar || null,
          targetType: a.target_type || 'project',
          targetTitle: a.target_title || null,
          createdAt: a.created_at,
        }));
      }
    } catch {}

    return [];
  }
}
