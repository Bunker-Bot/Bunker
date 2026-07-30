import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export type TimelineFilterOptions = {
  projectId: string;
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
};

export const TimelineRepository = {
  /**
   * Fetch paginated project_updates with filtering and minimal column selection
   */
  async getUpdatesPaginated(options: TimelineFilterOptions) {
    const {
      projectId,
      limit = 20,
      offset = 0,
      search = '',
      category = '',
      dateFrom = null,
      dateTo = null,
    } = options;

    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('project_updates')
        .select(`
          id,
          project_id,
          title,
          description,
          entry_date,
          attachments,
          created_at,
          created_by,
          author:created_by ( full_name, avatar_url )
        `, { count: 'exact' })
        .eq('project_id', projectId)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      if (category.trim() && category.toLowerCase() !== 'all') {
        query = query.ilike('title', `%${category.trim()}%`);
      }

      if (dateFrom) {
        query = query.gte('entry_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('entry_date', dateTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        items: data || [],
        totalCount: count || 0,
        hasMore: (offset + (data?.length || 0)) < (count || 0),
      };
    }, 'high');
  },

  /**
   * Create a new project_updates entry
   */
  async createUpdate(payload: {
    project_id: string;
    title: string;
    description?: string;
    entry_date?: string;
    attachments?: any[];
  }) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .insert({
          project_id: payload.project_id,
          title: payload.title,
          description: payload.description || '',
          entry_date: payload.entry_date || new Date().toISOString().split('T')[0],
          attachments: payload.attachments || [],
        })
        .select(`
          id,
          project_id,
          title,
          description,
          entry_date,
          attachments,
          created_at,
          created_by,
          author:created_by ( full_name, avatar_url )
        `)
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  /**
   * Update an existing project_updates entry
   */
  async updateUpdate(
    id: string,
    payload: {
      title?: string;
      description?: string;
      entry_date?: string;
      attachments?: any[];
    }
  ) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('project_updates')
        .update(payload)
        .eq('id', id)
        .select(`
          id,
          project_id,
          title,
          description,
          entry_date,
          attachments,
          created_at,
          created_by,
          author:created_by ( full_name, avatar_url )
        `)
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },

  /**
   * Delete a project_updates entry
   */
  async deleteUpdate(id: string) {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }, 'critical');
  },
};

export default TimelineRepository;
