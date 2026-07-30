import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export interface DashboardSummary {
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  clientCount: number;
  recentProjects: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    progress: number;
    deadline?: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    created_at: string;
  }>;
}

export const DashboardRepository = {
  async getSummary(): Promise<DashboardSummary> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.rpc('get_dashboard_summary');
      if (error) {
        // Fallback query if RPC migration has not been applied yet
        const [{ count: projectCount }, { count: clientCount }] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
        ]);

        return {
          projectCount: projectCount || 0,
          activeProjects: projectCount || 0,
          completedProjects: 0,
          clientCount: clientCount || 0,
          recentProjects: [],
          recentActivity: [],
        };
      }
      return data as DashboardSummary;
    }, 'critical');
  },
};

export default DashboardRepository;
