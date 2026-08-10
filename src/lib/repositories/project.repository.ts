import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import { getTechnologyIcon } from '../constants/technology-icons';

export interface ProjectQueryOptions {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  priority?: string;
  clientId?: string;
  technology?: string;
  deadline?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'deadline' | 'completion_percent' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectOverview {
  project: any;
  milestones: any[];
  taskCounts: {
    todo: number;
    in_progress: number;
    review: number;
    testing: number;
    completed: number;
  };
}

export const ProjectRepository = {
  async getProjects(options: ProjectQueryOptions = {}) {
    return requestQueue.enqueue(async () => {
      const {
        limit = 12,
        offset = 0,
        search,
        status,
        priority,
        clientId,
        sortBy = 'updated_at',
        sortOrder = 'desc',
      } = options;

      let query = supabase
        .from('projects')
        .select(
          'id, client_id, name, slug, description, status, priority, start_date, deadline, completion_percent, color, thumbnail_url, created_at, updated_at, clients(id, name, company), project_technologies(name)',
          { count: 'exact' }
        )
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
      }
      if (clientId && clientId !== 'all') {
        query = query.eq('client_id', clientId);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      const formattedProjects = (data || []).map((proj: any) => ({
        ...proj,
        technologies: proj.project_technologies?.map((t: any) => t.name) || [],
      }));

      return {
        projects: formattedProjects,
        totalCount: count || 0,
      };
    }, 'high');
  },

  async getProjectBySlug(identifier: string) {
    return requestQueue.enqueue(async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let query = supabase
        .from('projects')
        .select(
          'id, client_id, name, slug, description, status, priority, start_date, deadline, completion_percent, color, thumbnail_url, created_by, created_at, updated_at, clients(id, name, company, email), project_technologies(name)'
        );

      if (isUuid) {
        query = query.or(`slug.eq.${identifier},id.eq.${identifier}`);
      } else {
        query = query.eq('slug', identifier);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      if (!data) throw new Error(`Project not found: ${identifier}`);

      return {
        ...data,
        technologies: data.project_technologies?.map((t: any) => t.name) || [],
      };
    }, 'high');
  },

  async getProjectCounts() {
    return requestQueue.enqueue(async () => {
      const [projectsRes, clientsRes, githubRes] = await Promise.all([
        supabase.from('projects').select('id, status, deadline, completion_percent'),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('github_repositories').select('id', { count: 'exact', head: true }),
      ]);

      const projects = projectsRes.data || [];
      const total = projects.length;
      const active = projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length;
      const completed = projects.filter((p) => p.status === 'completed').length;
      const archived = projects.filter((p) => p.status === 'on_hold' || p.status === 'cancelled').length;
      const draft = projects.filter((p) => p.status === 'planning').length;
      
      const now = new Date().toISOString().split('T')[0];
      const overdue = projects.filter((p) => p.deadline && p.deadline < now && p.status !== 'completed').length;

      const totalCompletionSum = projects.reduce((acc, p) => acc + (p.completion_percent || 0), 0);
      const averageCompletion = total > 0 ? Math.round(totalCompletionSum / total) : 0;

      return {
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed,
        archivedProjects: archived,
        draftProjects: draft,
        overdueProjects: overdue,
        totalClients: clientsRes.count || 0,
        averageCompletion,
        totalGithubRepos: githubRes.count || 0,
      };
    }, 'medium');
  },

  async getWorkspaceActivity() {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .select('id, project_id, title, description, entry_date, created_at, projects(name, slug)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) return [];
      return data || [];
    }, 'low');
  },

  async getWorkspaceStorage() {
    return requestQueue.enqueue(async () => {
      const [docsRes, shareLinksRes] = await Promise.all([
        supabase.from('documents').select('id, doc_type', { count: 'exact' }),
        supabase.from('share_links').select('id', { count: 'exact', head: true }),
      ]);

      const totalDocs = docsRes.count || 0;
      const totalShareLinks = shareLinksRes.count || 0;
      const estimatedMB = Math.max(12, Math.round((totalDocs * 0.8) + (totalShareLinks * 1.2)));

      return {
        totalDocuments: totalDocs,
        totalFiles: Math.round(totalDocs * 2.4),
        totalShareLinks,
        usedMB: estimatedMB,
        capacityMB: 5000,
        percentageUsed: Math.min(100, Math.round((estimatedMB / 5000) * 100)),
      };
    }, 'low');
  },

  async checkProjectDependencies(id: string) {
    return requestQueue.enqueue(async () => {
      const [tasksRes, milestonesRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('project_id', id),
        supabase.from('milestones').select('id', { count: 'exact', head: true }).eq('project_id', id),
      ]);

      const tasksCount = tasksRes.count || 0;
      const milestonesCount = milestonesRes.count || 0;
      const hasDependencies = tasksCount > 0 || milestonesCount > 0;

      return {
        hasDependencies,
        tasksCount,
        milestonesCount,
      };
    }, 'medium');
  },

  async createProject(projectData: any) {
    return requestQueue.enqueue(async () => {
      const { technologies, ...insertPayload } = projectData;

      if (!insertPayload.created_by) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          insertPayload.created_by = user.id;
        }
      }

      if (!insertPayload.slug && insertPayload.name) {
        insertPayload.slug = insertPayload.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      // Sync technologies to project_technologies table
      if (Array.isArray(technologies) && technologies.length > 0 && data?.id) {
        const techRows = technologies.map((techName: string) => ({
          project_id: data.id,
          name: techName,
          icon_url: getTechnologyIcon(techName),
        }));
        await supabase.from('project_technologies').insert(techRows);
      }

      return data;
    }, 'critical');
  },

  async updateProject(id: string, projectData: any) {
    return requestQueue.enqueue(async () => {
      const { technologies, ...updatePayload } = projectData;

      const { data, error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Sync technologies to project_technologies table
      if (Array.isArray(technologies)) {
        await supabase.from('project_technologies').delete().eq('project_id', id);

        if (technologies.length > 0) {
          const techRows = technologies.map((techName: string) => ({
            project_id: id,
            name: techName,
            icon_url: getTechnologyIcon(techName),
          }));
          await supabase.from('project_technologies').insert(techRows);
        }
      }

      return data;
    }, 'critical');
  },

  async archiveProject(id: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('projects')
        .update({ status: 'on_hold' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  async restoreProject(id: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('projects')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  async deleteProject(id: string) {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }, 'critical');
  },

  async getOverview(projectId: string): Promise<ProjectOverview | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.rpc('get_project_overview', {
        target_project: projectId,
      });

      if (error || !data) {
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (!project) return null;

        const { data: milestones } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order', { ascending: true });

        return {
          project,
          milestones: milestones || [],
          taskCounts: { todo: 0, in_progress: 0, review: 0, testing: 0, completed: 0 },
        };
      }

      return data as ProjectOverview;
    }, 'high');
  },

  async search(query: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.rpc('search_everything', {
        search_term: query,
      });
      if (error) return { projects: [], clients: [], tasks: [] };
      return data;
    }, 'medium');
  },
};

export default ProjectRepository;
