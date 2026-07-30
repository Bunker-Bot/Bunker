import { ProjectRepository, type ProjectQueryOptions, type ProjectOverview } from '../repositories/project.repository';

export type FormattedProjectOverview = ProjectOverview;

export interface ProjectDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  clientId?: string;
  clientName: string;
  clientCompany?: string;
  status: 'planning' | 'active' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  deadline?: string;
  relativeDeadline: string;
  isOverdue: boolean;
  completionPercent: number;
  color: string;
  thumbnailUrl?: string;
  technologies?: string[];
  createdAt: string;
  updatedAt: string;
  formattedUpdatedAt: string;
}

export const formatRelativeDeadline = (deadlineStr?: string, status?: string): { relative: string; isOverdue: boolean } => {
  if (!deadlineStr) return { relative: 'No Deadline', isOverdue: false };

  const deadline = new Date(deadlineStr);
  const now = new Date();

  // Strip time component for pure date comparison
  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (status === 'completed') {
    return { relative: `Completed on ${deadlineStr}`, isOverdue: false };
  }

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return { relative: `Overdue by ${absDays} ${absDays === 1 ? 'Day' : 'Days'}`, isOverdue: true };
  }

  if (diffDays === 0) {
    return { relative: 'Due Today', isOverdue: true };
  }

  if (diffDays === 1) {
    return { relative: '1 Day Left', isOverdue: false };
  }

  if (diffDays < 7) {
    return { relative: `${diffDays} Days Left`, isOverdue: false };
  }

  const weeks = Math.floor(diffDays / 7);
  return { relative: `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} Left`, isOverdue: false };
};

export const ProjectService = {
  async getProjectsList(options: ProjectQueryOptions = {}) {
    try {
      const { projects, totalCount } = await ProjectRepository.getProjects(options);

      const formattedProjects: ProjectDTO[] = projects.map((proj: any) => {
        const { relative, isOverdue } = formatRelativeDeadline(proj.deadline, proj.status);
        const updatedDate = proj.updated_at ? new Date(proj.updated_at) : new Date();
        const clientObj = Array.isArray(proj.clients) ? proj.clients[0] : proj.clients;

        return {
          id: proj.id,
          name: proj.name,
          slug: proj.slug,
          description: proj.description,
          clientId: proj.client_id,
          clientName: clientObj?.name || 'Unassigned Client',
          clientCompany: clientObj?.company,
          status: proj.status || 'planning',
          priority: proj.priority || 'medium',
          startDate: proj.start_date,
          deadline: proj.deadline,
          relativeDeadline: relative,
          isOverdue,
          completionPercent: proj.completion_percent || 0,
          color: proj.color || '#E11D48',
          thumbnailUrl: proj.thumbnail_url,
          technologies: proj.technologies || [],
          createdAt: proj.created_at,
          updatedAt: proj.updated_at,
          formattedUpdatedAt: updatedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };
      });

      return { projects: formattedProjects, totalCount };
    } catch (error: any) {
      console.error('[ProjectService] Failed to load projects directory:', error);
      throw new Error(error.message || 'Unable to fetch project directory. Please try again.');
    }
  },

  async getProjectBySlug(slug: string): Promise<ProjectDTO> {
    try {
      const proj = await ProjectRepository.getProjectBySlug(slug);
      const { relative, isOverdue } = formatRelativeDeadline(proj.deadline, proj.status);
      const updatedDate = proj.updated_at ? new Date(proj.updated_at) : new Date();
      const clientObj = Array.isArray(proj.clients) ? proj.clients[0] : proj.clients;

      return {
        id: proj.id,
        name: proj.name,
        slug: proj.slug,
        description: proj.description,
        clientId: proj.client_id,
        clientName: clientObj?.name || 'Unassigned Client',
        clientCompany: clientObj?.company,
        status: proj.status || 'planning',
        priority: proj.priority || 'medium',
        startDate: proj.start_date,
        deadline: proj.deadline,
        relativeDeadline: relative,
        isOverdue,
        completionPercent: proj.completion_percent || 0,
        color: proj.color || '#E11D48',
        thumbnailUrl: proj.thumbnail_url,
        technologies: proj.technologies || [],
        createdAt: proj.created_at,
        updatedAt: proj.updated_at,
        formattedUpdatedAt: updatedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    } catch (error: any) {
      console.error(`[ProjectService] Failed to load project slug ${slug}:`, error);
      throw new Error(error.message || 'Unable to fetch project specifications.');
    }
  },

  async getProjectCounts() {
    try {
      return await ProjectRepository.getProjectCounts();
    } catch (error: any) {
      console.error('[ProjectService] Failed to calculate project counts:', error);
      return { totalProjects: 0, activeProjects: 0, completedProjects: 0, overdueProjects: 0 };
    }
  },

  async getOverview(id: string) {
    try {
      return await ProjectRepository.getOverview(id);
    } catch (error: any) {
      console.error(`[ProjectService] Get overview for project ${id} failed:`, error);
      return null;
    }
  },

  async checkDependencies(id: string) {
    try {
      return await ProjectRepository.checkProjectDependencies(id);
    } catch (error: any) {
      console.error(`[ProjectService] Check dependencies for project ${id} failed:`, error);
      return { hasDependencies: false, tasksCount: 0, milestonesCount: 0 };
    }
  },

  async createProject(data: any) {
    try {
      return await ProjectRepository.createProject(data);
    } catch (error: any) {
      console.error('[ProjectService] Create project failed:', error);
      throw new Error(error.message || 'Failed to create project record.');
    }
  },

  async updateProject(id: string, data: any) {
    try {
      return await ProjectRepository.updateProject(id, data);
    } catch (error: any) {
      console.error(`[ProjectService] Update project ${id} failed:`, error);
      throw new Error(error.message || 'Failed to update project record.');
    }
  },

  async archiveProject(id: string) {
    try {
      return await ProjectRepository.archiveProject(id);
    } catch (error: any) {
      console.error(`[ProjectService] Archive project ${id} failed:`, error);
      throw new Error(error.message || 'Failed to archive project record.');
    }
  },

  async restoreProject(id: string) {
    try {
      return await ProjectRepository.restoreProject(id);
    } catch (error: any) {
      console.error(`[ProjectService] Restore project ${id} failed:`, error);
      throw new Error(error.message || 'Failed to restore project record.');
    }
  },

  async deleteProject(id: string) {
    try {
      return await ProjectRepository.deleteProject(id);
    } catch (error: any) {
      console.error(`[ProjectService] Delete project ${id} failed:`, error);
      throw new Error(error.message || 'Failed to delete project record.');
    }
  },

  async getWorkspaceActivity() {
    try {
      return await ProjectRepository.getWorkspaceActivity();
    } catch (error: any) {
      console.error('[ProjectService] Get activity failed:', error);
      return [];
    }
  },

  async getWorkspaceStorage() {
    try {
      return await ProjectRepository.getWorkspaceStorage();
    } catch (error: any) {
      console.error('[ProjectService] Get storage failed:', error);
      return { totalDocuments: 0, totalFiles: 0, totalShareLinks: 0, usedMB: 0, capacityMB: 5000, percentageUsed: 0 };
    }
  },
};

export default ProjectService;
