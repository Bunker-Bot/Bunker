import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import type { CreateChangelogInput, UpdateChangelogInput } from '../../modules/changelog/types/changelog';

export const ChangelogRepository = {
  async getChangelogByProject(projectId?: string | null) {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('changelog_entries')
        .select('id, project_id, version, title, description, released_at, created_at, updated_at')
        .order('released_at', { ascending: false });

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }, 'low');
  },

  async createChangelogEntry(input: CreateChangelogInput) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .insert({
          project_id: input.projectId,
          version: input.version,
          title: input.title,
          description: input.description,
          released_at: input.releasedAt || new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async updateChangelogEntry(input: UpdateChangelogInput) {
    return requestQueue.enqueue(async () => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (input.version !== undefined) updates.version = input.version;
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.releasedAt !== undefined) updates.released_at = input.releasedAt;

      const { data, error } = await supabase
        .from('changelog_entries')
        .update(updates)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async deleteChangelogEntry(id: string) {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('changelog_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }, 'high');
  },

  async isVersionExists(projectId: string, version: string, excludeId?: string) {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('changelog_entries')
        .select('id')
        .eq('project_id', projectId)
        .eq('version', version.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) return false;
      return Boolean(data && data.length > 0);
    }, 'low');
  },
};

export default ChangelogRepository;
