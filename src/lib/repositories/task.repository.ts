import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'testing' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskFilterOptions {
  projectId?: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  priority?: string;
  module?: string;
  dueDateFilter?: 'all' | 'today' | 'this_week' | 'overdue' | 'upcoming';
  sortBy?: 'sort_order' | 'due_date' | 'created_at' | 'priority' | 'progress' | 'status' | 'module' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskItem {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  module?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  progress: number;
  labels: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  } | null;
}

export interface TaskStatistics {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  testing: number;
  completed: number;
  overdue: number;
}

export const TaskRepository = {
  /**
   * Fetch Paginated & Filtered Tasks with Minimal Column Selection
   */
  async getTasks(options: TaskFilterOptions = {}): Promise<{ tasks: TaskItem[]; totalCount: number }> {
    const {
      projectId,
      limit = 25,
      offset = 0,
      search = '',
      status = 'all',
      priority = 'all',
      module = 'all',
      dueDateFilter = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('tasks')
        .select(
          `
          id,
          project_id,
          title,
          description,
          module,
          priority,
          status,
          due_date,
          progress,
          labels,
          sort_order,
          created_at,
          updated_at,
          project:projects ( id, name, slug, color )
        `,
          { count: 'exact' }
        )
        .order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      if (search.trim()) {
        const pattern = `%${search.trim()}%`;
        query = query.or(`title.ilike.${pattern},module.ilike.${pattern}`);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority);
      }

      if (module && module !== 'all') {
        query = query.eq('module', module);
      }

      // Date Filtering Logic
      if (dueDateFilter && dueDateFilter !== 'all') {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (dueDateFilter === 'today') {
          query = query.eq('due_date', todayStr);
        } else if (dueDateFilter === 'overdue') {
          query = query.lt('due_date', todayStr).neq('status', 'completed');
        } else if (dueDateFilter === 'upcoming') {
          query = query.gt('due_date', todayStr);
        } else if (dueDateFilter === 'this_week') {
          const endOfWeek = new Date(now);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
          query = query.gte('due_date', todayStr).lte('due_date', endOfWeekStr);
        }
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        tasks: (data || []) as unknown as TaskItem[],
        totalCount: count || 0,
      };
    }, 'high');
  },

  /**
   * Fetch Single Aggregate Query for Task Metrics & Counts
   */
  async getTaskStatistics(projectId?: string): Promise<TaskStatistics> {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('tasks')
        .select('id, status, due_date');

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const todayStr = new Date().toISOString().split('T')[0];

      const stats: TaskStatistics = {
        total: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        testing: 0,
        completed: 0,
        overdue: 0,
      };

      if (!data) return stats;

      stats.total = data.length;

      data.forEach((task: any) => {
        if (task.status === 'todo') stats.todo++;
        else if (task.status === 'in_progress') stats.inProgress++;
        else if (task.status === 'review') stats.review++;
        else if (task.status === 'testing') stats.testing++;
        else if (task.status === 'completed') stats.completed++;

        if (task.due_date && task.due_date < todayStr && task.status !== 'completed') {
          stats.overdue++;
        }
      });

      return stats;
    }, 'medium');
  },

  /**
   * Fetch Distinct Task Modules List
   */
  async getTaskModules(projectId?: string): Promise<string[]> {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('tasks')
        .select('module')
        .not('module', 'is', null);

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const modulesSet = new Set<string>();
      data?.forEach((row: any) => {
        if (row.module && row.module.trim()) {
          modulesSet.add(row.module.trim());
        }
      });

      return Array.from(modulesSet).sort();
    }, 'low');
  },

  /**
   * Create New Task
   */
  async createTask(taskData: Partial<TaskItem>): Promise<TaskItem> {
    return requestQueue.enqueue(async () => {
      const payload = {
        project_id: taskData.project_id,
        title: taskData.title,
        description: taskData.description || null,
        module: taskData.module || null,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        due_date: taskData.due_date || null,
        progress: Math.min(100, Math.max(0, taskData.progress || 0)),
        labels: taskData.labels || [],
        sort_order: taskData.sort_order || 0,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select(`
          id,
          project_id,
          title,
          description,
          module,
          priority,
          status,
          due_date,
          progress,
          labels,
          sort_order,
          created_at,
          updated_at,
          project:projects ( id, name, slug, color )
        `)
        .single();

      if (error) throw error;
      return data as unknown as TaskItem;
    }, 'critical');
  },

  /**
   * Update Single Task
   */
  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    return requestQueue.enqueue(async () => {
      const payload: Record<string, any> = { ...updates };
      delete payload.id;
      delete payload.project;
      payload.updated_at = new Date().toISOString();

      if (typeof payload.progress === 'number') {
        payload.progress = Math.min(100, Math.max(0, payload.progress));
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select(`
          id,
          project_id,
          title,
          description,
          module,
          priority,
          status,
          due_date,
          progress,
          labels,
          sort_order,
          created_at,
          updated_at,
          project:projects ( id, name, slug, color )
        `)
        .single();

      if (error) throw error;
      return data as unknown as TaskItem;
    }, 'high');
  },

  /**
   * Bulk Update Tasks (Status, Priority, Labels)
   */
  async bulkUpdateTasks(ids: string[], updates: Partial<TaskItem>): Promise<void> {
    if (!ids || ids.length === 0) return;

    return requestQueue.enqueue(async () => {
      const payload: Record<string, any> = { ...updates };
      delete payload.id;
      delete payload.project;
      payload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .in('id', ids);

      if (error) throw error;
    }, 'high');
  },

  /**
   * Delete Single Task
   */
  async deleteTask(id: string): Promise<void> {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    }, 'critical');
  },

  /**
   * Bulk Delete Tasks
   */
  async bulkDeleteTasks(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;

    return requestQueue.enqueue(async () => {
      const { error } = await supabase.from('tasks').delete().in('id', ids);
      if (error) throw error;
    }, 'critical');
  },

  /**
   * Transactional Move Task & Batch Reorder Status Column
   */
  async moveTask(params: {
    taskId: string;
    newStatus: TaskStatus;
    newSortOrder: number;
    reorderedTasks?: { id: string; sort_order: number }[];
  }): Promise<void> {
    const { taskId, newStatus, newSortOrder, reorderedTasks = [] } = params;

    return requestQueue.enqueue(async () => {
      const nowStr = new Date().toISOString();

      // Update primary moved task (status + sort_order + progress if completed)
      const primaryPayload: Record<string, any> = {
        status: newStatus,
        sort_order: newSortOrder,
        updated_at: nowStr,
      };
      if (newStatus === 'completed') {
        primaryPayload.progress = 100;
      }

      const { error: moveError } = await supabase
        .from('tasks')
        .update(primaryPayload)
        .eq('id', taskId);

      if (moveError) throw moveError;

      // Batch update sort orders of affected column items if any
      if (reorderedTasks.length > 0) {
        const updatePromises = reorderedTasks.map((t) =>
          supabase
            .from('tasks')
            .update({ sort_order: t.sort_order, updated_at: nowStr })
            .eq('id', t.id)
        );
        await Promise.all(updatePromises);
      }
    }, 'critical');
  },

  /**
   * Fetch Single Task By ID
   */
  async getTaskById(id: string): Promise<TaskItem | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          project_id,
          title,
          description,
          module,
          priority,
          status,
          progress,
          due_date,
          labels,
          sort_order,
          created_at,
          updated_at,
          project:projects (
            id,
            name,
            slug,
            color
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return (data as unknown) as TaskItem;
    }, 'medium');
  },

  /**
   * Fetch Task Attachments
   */
  async getTaskAttachments(taskId: string): Promise<{ id: string; task_id: string; file_name: string; file_url: string; created_at: string }[]> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('id, task_id, file_name, file_url, created_at')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }, 'low');
  },

  /**
   * Upload Task Attachment to Supabase Storage & Insert Record
   */
  async uploadTaskAttachment(taskId: string, file: File): Promise<{ id: string; task_id: string; file_name: string; file_url: string; created_at: string }> {
    return requestQueue.enqueue(async () => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `tasks/${taskId}/${fileName}`;

      // Upload file to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('bunker-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        // Fallback bucket if bunker-assets doesn't exist
        const { error: fallbackError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (fallbackError) throw uploadError;
      }

      // Obtain Public URL
      const { data: urlData } = supabase.storage.from('bunker-assets').getPublicUrl(filePath);
      const fileUrl = urlData?.publicUrl || filePath;

      // Insert record
      const { data, error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_url: fileUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data;
    }, 'medium');
  },

  /**
   * Delete Task Attachment
   */
  async deleteTaskAttachment(id: string): Promise<void> {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase.from('task_attachments').delete().eq('id', id);
      if (error) throw error;
    }, 'medium');
  },
};
