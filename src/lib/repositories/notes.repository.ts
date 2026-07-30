import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import type { CreateNoteInput, UpdateNoteInput, NoteFilters } from '../../modules/notes/types/notes';

export const NotesRepository = {
  async getNotes(filters: NoteFilters = {}) {
    return requestQueue.enqueue(async () => {
      const {
        projectId,
        clientId,
        search,
        tag,
        isPinnedOnly,
        isArchivedOnly = false,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = filters;

      let query = supabase
        .from('notes')
        .select('id, project_id, client_id, title, content, tags, is_pinned, is_archived, created_by, created_at, updated_at, projects(id, name), clients(id, name)')
        .eq('is_archived', isArchivedOnly)
        .order('is_pinned', { ascending: false })
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      if (clientId && clientId !== 'all') {
        query = query.eq('client_id', clientId);
      }

      if (isPinnedOnly) {
        query = query.eq('is_pinned', true);
      }

      if (tag && tag !== 'all') {
        query = query.contains('tags', [tag]);
      }

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }, 'low');
  },

  async createNote(input: CreateNoteInput, createdBy: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          project_id: input.projectId || null,
          client_id: input.clientId || null,
          title: input.title || 'Untitled Note',
          content: input.content,
          tags: input.tags || ['General'],
          is_pinned: input.isPinned ?? false,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async updateNote(input: UpdateNoteInput) {
    return requestQueue.enqueue(async () => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) updates.title = input.title;
      if (input.content !== undefined) updates.content = input.content;
      if (input.tags !== undefined) updates.tags = input.tags;
      if (input.isPinned !== undefined) updates.is_pinned = input.isPinned;
      if (input.isArchived !== undefined) updates.is_archived = input.isArchived;
      if (input.projectId !== undefined) updates.project_id = input.projectId;
      if (input.clientId !== undefined) updates.client_id = input.clientId;

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async deleteNote(id: string) {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }, 'high');
  },

  async togglePin(id: string, isPinned: boolean) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },

  async toggleArchive(id: string, isArchived: boolean) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('notes')
        .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    }, 'high');
  },
};

export default NotesRepository;
