import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import type { Milestone } from '../../types';

const isUUID = (str?: string) =>
  Boolean(str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str));

export const MilestoneRepository = {
  /**
   * Fetch all milestones for a project with optional attachments
   */
  async getMilestonesByProject(projectId?: string): Promise<Milestone[]> {
    return requestQueue.enqueue(async () => {
      let query = supabase.from('milestones').select('*, attachments:milestone_attachments(*)');
      if (isUUID(projectId)) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) {
        // Fall back to basic select if attachments query fails
        let fallbackQuery = supabase.from('milestones').select('*');
        if (isUUID(projectId)) {
          fallbackQuery = fallbackQuery.eq('project_id', projectId);
        }
        const { data: basicData, error: basicErr } = await fallbackQuery.order('sort_order', { ascending: true });
        if (basicErr) {
          console.warn('[MilestoneRepository] getMilestonesByProject error:', basicErr.message);
          return [];
        }
        return (basicData || []).map(m => ({ ...m, name: m.name || m.title || 'Untitled Milestone' }));
      }

      return (data || []).map(m => ({
        ...m,
        name: m.name || m.title || 'Untitled Milestone',
        attachments: m.attachments || [],
      }));
    }, 'high');
  },

  /**
   * Create a new milestone
   */
  async createMilestone(milestone: Partial<Milestone>): Promise<Milestone> {
    return requestQueue.enqueue(async () => {
      const payload = {
        project_id: isUUID(milestone.project_id) ? milestone.project_id : null,
        name: milestone.name || milestone.title || 'New Milestone',
        description: milestone.description || milestone.notes || '',
        status: milestone.status || 'in_progress',
        priority: milestone.priority || 'medium',
        progress: milestone.progress || 0,
        start_date: milestone.start_date || milestone.startDate || null,
        due_date: milestone.due_date || milestone.dueDate || null,
        sort_order: milestone.sort_order || 0,
        owner_name: milestone.owner_name || milestone.ownerName || 'Project Team',
        labels: milestone.labels || [],
        version: milestone.version || '',
        sprint: milestone.sprint || '',
        deliverables: milestone.deliverables || [],
        dependencies: milestone.dependencies || [],
        tasks_count: milestone.tasks_count || milestone.tasksCount || 0,
        completed_tasks_count: milestone.completed_tasks_count || milestone.completedTasksCount || 0,
      };

      const { data, error } = await supabase
        .from('milestones')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  /**
   * Update an existing milestone
   */
  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone> {
    return requestQueue.enqueue(async () => {
      if (!isUUID(milestoneId)) {
        // Fall back to creating a real milestone if the ID is a non-UUID placeholder
        return await this.createMilestone({
          ...updates,
          name: updates.name || updates.title || 'New Milestone',
        });
      }

      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.start_date !== undefined) payload.start_date = updates.start_date;
      if (updates.due_date !== undefined) payload.due_date = updates.due_date;
      if (updates.completion_date !== undefined) payload.completion_date = updates.completion_date;
      if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
      if (updates.owner_name !== undefined) payload.owner_name = updates.owner_name;
      if (updates.labels !== undefined) payload.labels = updates.labels;
      if (updates.version !== undefined) payload.version = updates.version;
      if (updates.sprint !== undefined) payload.sprint = updates.sprint;
      if (updates.deliverables !== undefined) payload.deliverables = updates.deliverables;
      if (updates.dependencies !== undefined) payload.dependencies = updates.dependencies;
      if (updates.tasks_count !== undefined) payload.tasks_count = updates.tasks_count;
      if (updates.completed_tasks_count !== undefined) payload.completed_tasks_count = updates.completed_tasks_count;

      const { data, error } = await supabase
        .from('milestones')
        .update(payload)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  /**
   * Delete a milestone
   */
  async deleteMilestone(milestoneId: string): Promise<boolean> {
    return requestQueue.enqueue(async () => {
      if (!isUUID(milestoneId)) {
        return true;
      }

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
      return true;
    }, 'critical');
  },

  /**
   * Update milestone progress
   */
  async updateMilestoneProgress(milestoneId: string, progress: number): Promise<Milestone> {
    const isCompleted = progress >= 100;
    return this.updateMilestone(milestoneId, {
      progress,
      status: isCompleted ? 'completed' : 'in_progress',
      completion_date: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
    });
  },

  /**
   * Toggle milestone complete status
   */
  async toggleMilestoneComplete(milestoneId: string, currentStatus: string): Promise<Milestone> {
    const isNowComplete = currentStatus !== 'completed';
    return this.updateMilestone(milestoneId, {
      progress: isNowComplete ? 100 : 50,
      status: isNowComplete ? 'completed' : 'in_progress',
      completion_date: isNowComplete ? new Date().toISOString().split('T')[0] : undefined,
    });
  },

  /**
   * Reorder milestones array by updating sort_order sequentially
   */
  async reorderMilestones(milestones: { id: string; sort_order: number }[]): Promise<void> {
    return requestQueue.enqueue(async () => {
      for (const m of milestones) {
        await supabase
          .from('milestones')
          .update({ sort_order: m.sort_order })
          .eq('id', m.id);
      }
    }, 'high');
  },

  /**
   * Add attachment to milestone
   */
  async addAttachment(milestoneId: string, fileName: string, fileUrl: string, fileType = 'link'): Promise<any> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('milestone_attachments')
        .insert({
          milestone_id: milestoneId,
          file_name: fileName,
          file_url: fileUrl,
          file_type: fileType,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 'high');
  },

  /**
   * Delete attachment
   */
  async deleteAttachment(attachmentId: string): Promise<boolean> {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('milestone_attachments')
        .delete()
        .eq('id', attachmentId);
      if (error) throw error;
      return true;
    }, 'high');
  },
};

export default MilestoneRepository;
