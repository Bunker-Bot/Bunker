import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export interface SanitizedPortalProject {
  id: string;
  name: string;
  description: string;
  status: string;
  completionPercent: number;
  deadline?: string;
  milestones: Array<{
    id: string;
    name: string;
    progress: number;
    dueDate?: string;
    isCompleted: boolean;
  }>;
  sections: Array<{
    id: string;
    name: string;
    content: string;
  }>;
  updates: Array<{
    id: string;
    title: string;
    description: string;
    entryDate: string;
  }>;
  screenshots: Array<{
    id: string;
    title: string;
    signedImageUrl: string;
  }>;
}

export const PortalService = {
  async getPortalProject(projectId: string): Promise<SanitizedPortalProject | null> {
    return requestQueue.enqueue(async () => {
      // 1. Query project (RLS strictly enforces viewer role matching project_id)
      const { data: project, error: projError } = await supabase
        .from('projects')
        .select('id, name, description, status, completion_percent, deadline')
        .eq('id', projectId)
        .single();

      if (projError || !project) return null;

      // 2. Fetch milestones
      const { data: milestones } = await supabase
        .from('milestones')
        .select('id, name, progress, due_date')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      // 3. Fetch project sections
      const { data: sections } = await supabase
        .from('project_sections')
        .select('id, name, content')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      // 4. Fetch project updates
      const { data: updates } = await supabase
        .from('project_updates')
        .select('id, title, description, entry_date')
        .eq('project_id', projectId)
        .order('entry_date', { ascending: false });

      // 5. Fetch screenshots
      const { data: screenshots } = await supabase
        .from('screenshots')
        .select('id, title, image_url')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      // Return sanitized DTO stripping internal database fields
      return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        completionPercent: project.completion_percent || 0,
        deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : undefined,
        milestones: (milestones || []).map((m) => ({
          id: m.id,
          name: m.name,
          progress: m.progress || 0,
          dueDate: m.due_date ? new Date(m.due_date).toLocaleDateString() : undefined,
          isCompleted: (m.progress || 0) === 100,
        })),
        sections: (sections || []).map((s) => ({
          id: s.id,
          name: s.name,
          content: s.content || '',
        })),
        updates: (updates || []).map((u) => ({
          id: u.id,
          title: u.title,
          description: u.description || '',
          entryDate: new Date(u.entry_date).toLocaleDateString(),
        })),
        screenshots: (screenshots || []).map((sc) => ({
          id: sc.id,
          title: sc.title || 'Screenshot',
          signedImageUrl: sc.image_url,
        })),
      };
    }, 'critical');
  },
};

export default PortalService;
