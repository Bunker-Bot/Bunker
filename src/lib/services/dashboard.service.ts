import { DashboardRepository } from '../repositories/dashboard.repository';

export interface FormattedDashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  recentProjects: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    progressPercentage: number;
    formattedCreatedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    actionTitle: string;
    entityType: string;
    timeAgo: string;
  }>;
}

export interface ActivityFeedItem {
  id: string;
  actorName: string;
  actionTitle: string;
  entityType: string;
  entityName: string;
  timeAgo: string;
  createdAt: string;
}

export function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const dashboardService = {
  async getSummary(_options?: { signal?: AbortSignal }): Promise<FormattedDashboardSummary> {
    const raw = await DashboardRepository.getSummary();

    return {
      totalProjects: raw.projectCount,
      activeProjects: raw.activeProjects,
      completedProjects: raw.completedProjects,
      totalClients: raw.clientCount,
      recentProjects: (raw.recentProjects || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        progressPercentage: p.progress || 0,
        formattedCreatedAt: new Date(p.created_at).toLocaleDateString(),
      })),
      recentActivity: (raw.recentActivity || []).map((a) => ({
        id: a.id,
        actionTitle: a.action,
        entityType: a.entity_type,
        timeAgo: formatRelativeTime(a.created_at),
      })),
    };
  },

  async getSummaryData(options?: { signal?: AbortSignal }): Promise<FormattedDashboardSummary> {
    return this.getSummary(options);
  },

  async getRecentActivityData(limit = 20, _options?: { signal?: AbortSignal }): Promise<ActivityFeedItem[]> {
    const raw = await DashboardRepository.getSummary();
    const activities = (raw.recentActivity || []).slice(0, limit);

    return activities.map((a) => ({
      id: a.id,
      actorName: 'Admin',
      actionTitle: a.action,
      entityType: a.entity_type,
      entityName: a.entity_type,
      timeAgo: formatRelativeTime(a.created_at),
      createdAt: a.created_at,
    }));
  },
};

export const DashboardService = dashboardService;
export default dashboardService;
