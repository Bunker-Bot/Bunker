import { ClientRepository, type ClientQueryOptions } from '../repositories/client.repository';

export interface FormattedClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  countryFlag?: string;
  timezone?: string;
  website?: string;
  notes?: string;
  githubUsername?: string;
  socialLinks: Record<string, string>;
  projectCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  onHoldProjectsCount: number;
  cancelledProjectsCount: number;
  healthStatus: 'healthy' | 'at_risk' | 'inactive';
  healthScore: number;
  currentProject: {
    name: string;
    status: string;
    completionPercent: number;
  } | null;
  lastActivityRelative: string;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
}

const getCountryFlag = (countryName: string) => {
  if (!countryName) return '🌐';
  const c = countryName.toLowerCase().trim();
  if (c.includes('united states') || c.includes('usa') || c.includes('us')) return '🇺🇸';
  if (c.includes('india') || c.includes('in')) return '🇮🇳';
  if (c.includes('united kingdom') || c.includes('uk')) return '🇬🇧';
  if (c.includes('canada') || c.includes('ca')) return '🇨🇦';
  if (c.includes('germany') || c.includes('de')) return '🇩🇪';
  if (c.includes('australia') || c.includes('au')) return '🇦🇺';
  if (c.includes('france') || c.includes('fr')) return '🇫🇷';
  if (c.includes('japan') || c.includes('jp')) return '🇯🇵';
  if (c.includes('singapore') || c.includes('sg')) return '🇸🇬';
  if (c.includes('brazil') || c.includes('br')) return '🇧🇷';
  return '🌐';
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '—';
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const clientService = {
  async getClientsList(options: ClientQueryOptions = {}) {
    const { clients } = await ClientRepository.getClients(options);

    const formattedClients = await Promise.all(
      clients.map(async (c) => {
        const [stats, projects] = await Promise.all([
          ClientRepository.getClientStatistics(c.id),
          ClientRepository.getClientProjects(c.id),
        ]);

        const currentP = projects.length > 0 ? projects[0] : null;

        let health: 'healthy' | 'at_risk' | 'inactive' = 'inactive';
        let score = 30;
        if (stats.activeProjects > 0) {
          health = 'healthy';
          score = 94;
          if (currentP && currentP.completion_percent < 30 && currentP.deadline && new Date(currentP.deadline) < new Date()) {
            health = 'at_risk';
            score = 68;
          }
        } else if (stats.completedProjects > 0) {
          health = 'healthy';
          score = 90;
        }

        return {
          id: c.id,
          name: c.name,
          company: c.company || '—',
          email: c.email || '—',
          phone: c.phone || '',
          country: c.country || 'Global',
          countryFlag: getCountryFlag(c.country || ''),
          timezone: c.timezone || 'UTC',
          website: c.website || '',
          notes: c.notes || '',
          githubUsername: c.github_username || '',
          socialLinks: c.social_links || {},
          projectCount: stats.totalProjects,
          activeProjectsCount: stats.activeProjects,
          completedProjectsCount: stats.completedProjects,
          onHoldProjectsCount: stats.onHoldProjects,
          cancelledProjectsCount: stats.cancelledProjects,
          healthStatus: health,
          healthScore: score,
          currentProject: currentP
            ? {
                name: currentP.name,
                status: currentP.status || 'active',
                completionPercent: currentP.completion_percent || 0,
              }
            : null,
          lastActivityRelative: formatTimeAgo(c.updated_at || c.created_at),
          formattedCreatedAt: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          formattedUpdatedAt: new Date(c.updated_at || c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      })
    );

    let filtered = formattedClients;
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((c) => c.healthStatus === options.status);
    }
    if (options.activeProjects && options.activeProjects !== 'all') {
      if (options.activeProjects === 'has_active') {
        filtered = filtered.filter((c) => c.activeProjectsCount > 0);
      } else if (options.activeProjects === 'no_active') {
        filtered = filtered.filter((c) => c.activeProjectsCount === 0);
      }
    }

    if (options.sortBy === 'most_projects') {
      filtered.sort((a, b) => b.projectCount - a.projectCount);
    }

    return { clients: filtered, totalCount: filtered.length };
  },

  async getClientById(id: string): Promise<FormattedClient> {
    const c = await ClientRepository.getClientById(id);
    const [stats, projects] = await Promise.all([
      ClientRepository.getClientStatistics(c.id),
      ClientRepository.getClientProjects(c.id),
    ]);

    const currentP = projects.length > 0 ? projects[0] : null;
    let health: 'healthy' | 'at_risk' | 'inactive' = 'inactive';
    let score = 30;
    if (stats.activeProjects > 0) {
      health = 'healthy';
      score = 94;
    } else if (stats.completedProjects > 0) {
      health = 'healthy';
      score = 90;
    }

    return {
      id: c.id,
      name: c.name,
      company: c.company || '—',
      email: c.email || '—',
      phone: c.phone || '',
      country: c.country || 'Global',
      countryFlag: getCountryFlag(c.country || ''),
      timezone: c.timezone || 'UTC',
      website: c.website || '',
      notes: c.notes || '',
      githubUsername: c.github_username || '',
      socialLinks: c.social_links || {},
      projectCount: stats.totalProjects,
      activeProjectsCount: stats.activeProjects,
      completedProjectsCount: stats.completedProjects,
      onHoldProjectsCount: stats.onHoldProjects,
      cancelledProjectsCount: stats.cancelledProjects,
      healthStatus: health,
      healthScore: score,
      currentProject: currentP
        ? {
            name: currentP.name,
            status: currentP.status || 'active',
            completionPercent: currentP.completion_percent || 0,
          }
        : null,
      lastActivityRelative: formatTimeAgo(c.updated_at || c.created_at),
      formattedCreatedAt: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      formattedUpdatedAt: new Date(c.updated_at || c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  },

  async getWorkspaceClientCounts() {
    return ClientRepository.getWorkspaceClientCounts();
  },

  async getClientCountries() {
    return ClientRepository.getClientCountries();
  },

  async getClientExpandedDetails(clientId: string) {
    return ClientRepository.getClientExpandedDetails(clientId);
  },

  async getClient360Statistics(clientId: string) {
    return ClientRepository.getClient360Statistics(clientId);
  },

  async getClientTimeline(clientId: string) {
    return ClientRepository.getClientTimeline(clientId);
  },

  async getClientDocuments(clientId: string) {
    return ClientRepository.getClientDocuments(clientId);
  },

  async getClientShareLinks(clientId: string) {
    return ClientRepository.getClientShareLinks(clientId);
  },

  async getClientDeployments(clientId: string) {
    return ClientRepository.getClientDeployments(clientId);
  },

  async getClientGithub(clientId: string) {
    return ClientRepository.getClientGithub(clientId);
  },

  async getClientActivity(clientId: string) {
    return ClientRepository.getClientActivity(clientId);
  },

  async getClientProjects(clientId: string) {
    const rawProjects = await ClientRepository.getClientProjects(clientId);
    return rawProjects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status || 'active',
      priority: p.priority || 'medium',
      completionPercent: p.completion_percent || 0,
      deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : '—',
      formattedUpdatedAt: new Date(p.updated_at).toLocaleDateString(),
    }));
  },

  async getClientStatistics(clientId: string) {
    return ClientRepository.getClientStatistics(clientId);
  },

  async createClient(data: any) {
    return ClientRepository.createClient(data);
  },

  async updateClient(id: string, data: any) {
    return ClientRepository.updateClient(id, data);
  },

  async deleteClient(id: string) {
    const projectCount = await ClientRepository.getClientProjectCount(id);
    if (projectCount > 0) {
      throw new Error(`This client has ${projectCount} active project(s). Archive the client or move the projects before deletion.`);
    }
    return ClientRepository.deleteClient(id);
  },
};
