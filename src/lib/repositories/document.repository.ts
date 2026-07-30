import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export type DocumentType =
  | 'readme'
  | 'api'
  | 'setup'
  | 'installation'
  | 'architecture'
  | 'database'
  | 'user_manual'
  | 'deployment'
  | 'env'
  | 'release_notes'
  | 'changelog'
  | 'custom';

export type DocumentCategory =
  | 'Getting Started'
  | 'Development'
  | 'Backend'
  | 'Frontend'
  | 'Deployment'
  | 'Architecture'
  | 'Database'
  | 'API'
  | 'Client'
  | 'Operations'
  | 'General';

export interface DocumentItem {
  id: string;
  project_id: string;
  title: string;
  doc_type: DocumentType;
  category: DocumentCategory;
  content?: string | null;
  version: number;
  author: string;
  is_client_visible: boolean;
  is_favorite: boolean;
  is_locked: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
}

export interface DocumentVersionItem {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  change_summary: string;
  created_by: string;
  created_at: string;
}

export interface DocumentFilterOptions {
  projectId?: string;
  category?: string;
  docType?: string;
  search?: string;
  favoritesOnly?: boolean;
  clientVisibleOnly?: boolean;
  sortBy?: 'updated_at' | 'title' | 'version' | 'created_at' | 'sort_order';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

function normalizeDocItem(raw: any): DocumentItem {
  if (!raw) return {} as DocumentItem;
  let override: any = {};
  try {
    if (raw.id) {
      const local = localStorage.getItem(`bunker_doc_override_${raw.id}`);
      if (local) override = JSON.parse(local);
    }
  } catch {}

  const merged = { ...raw, ...override };

  return {
    id: merged.id,
    project_id: merged.project_id,
    title: merged.title || 'Untitled Document',
    doc_type: merged.doc_type || 'custom',
    category: (merged.category || 'General') as DocumentCategory,
    content: merged.content,
    version: merged.version || 1,
    author: merged.author || 'Administrator',
    is_client_visible: Boolean(merged.is_client_visible),
    is_favorite: Boolean(merged.is_favorite),
    is_locked: Boolean(merged.is_locked),
    sort_order: merged.sort_order || 0,
    created_at: merged.created_at || new Date().toISOString(),
    updated_at: merged.updated_at || new Date().toISOString(),
    project: Array.isArray(merged.project) ? merged.project[0] : merged.project,
  };
}

export const DocumentRepository = {
  /**
   * Fetch Minimal Document Items List (Progressive Loading)
   */
  async getDocumentsByProject(
    projectId?: string,
    options: DocumentFilterOptions = {}
  ): Promise<{ documents: DocumentItem[]; totalCount: number }> {
    const {
      category = 'all',
      docType = 'all',
      search = '',
      favoritesOnly = false,
      clientVisibleOnly = false,
      sortBy = 'created_at',
      sortOrder = 'asc',
      limit = 100,
      offset = 0,
    } = options;

    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('documents')
        .select('*, project:projects ( id, name, slug, color )', { count: 'exact' });

      if (sortBy === 'sort_order') {
        try {
          query = query.order('sort_order', { ascending: sortOrder === 'asc' });
        } catch {
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
        }
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
      query = query.range(offset, offset + limit - 1);

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      if (category && category !== 'all') {
        try { query = query.eq('category', category); } catch {}
      }

      if (docType && docType !== 'all') {
        query = query.eq('doc_type', docType);
      }

      if (favoritesOnly) {
        try { query = query.eq('is_favorite', true); } catch {}
      }

      if (clientVisibleOnly) {
        try { query = query.eq('is_client_visible', true); } catch {}
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      let { data, error, count } = await query;

      if (error) {
        // Fallback simple query if filter or select on missing column failed
        let fallbackQuery = supabase
          .from('documents')
          .select('*, project:projects ( id, name, slug, color )', { count: 'exact' })
          .order('created_at', { ascending: sortOrder === 'asc' })
          .range(offset, offset + limit - 1);

        if (projectId && projectId !== 'all') {
          fallbackQuery = fallbackQuery.eq('project_id', projectId);
        }
        if (docType && docType !== 'all') {
          fallbackQuery = fallbackQuery.eq('doc_type', docType);
        }
        if (search.trim()) {
          fallbackQuery = fallbackQuery.ilike('title', `%${search.trim()}%`);
        }

        const res = await fallbackQuery;
        if (res.error) throw res.error;
        data = res.data;
        count = res.count;
      }

      const docs = (data || []).map(normalizeDocItem);

      return {
        documents: docs,
        totalCount: count || 0,
      };
    }, 'high');
  },

  /**
   * Fetch Single Full Document Record (including Markdown content)
   */
  async getDocumentById(documentId: string): Promise<DocumentItem | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, project:projects ( id, name, slug, color )')
        .eq('id', documentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Check local override fallback
          try {
            const local = localStorage.getItem(`bunker_doc_override_${documentId}`);
            if (local) return normalizeDocItem(JSON.parse(local));
          } catch {}
          return null;
        }
        throw error;
      }

      return normalizeDocItem(data);
    }, 'critical');
  },

  /**
   * Fetch Document Version History (Lazy Loaded)
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersionItem[]> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) {
        console.warn('[DocumentRepository] Failed to load document_versions:', error);
        return [];
      }
      return (data || []).map((v: any) => ({
        id: v.id,
        document_id: v.document_id,
        content: v.content || '',
        version_number: v.version_number || 1,
        change_summary: v.change_summary || 'Updated document content',
        created_by: v.created_by || 'Administrator',
        created_at: v.created_at || new Date().toISOString(),
      }));
    }, 'low');
  },

  /**
   * Create New Documentation Entry
   */
  async createDocument(docData: Partial<DocumentItem>): Promise<DocumentItem> {
    return requestQueue.enqueue(async () => {
      const payload: Record<string, any> = {
        project_id: docData.project_id,
        title: docData.title || 'Untitled Document',
        doc_type: docData.doc_type || 'custom',
        content: docData.content || '# New Document\n\nAdd content here...',
        version: 1,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.warn('[DocumentRepository] Error inserting document:', error);
        throw error;
      }

      return normalizeDocItem(data);
    }, 'critical');
  },

  /**
   * Save Document with Local Overrides & Upsert
   */
  async saveDocument(
    documentId: string,
    updates: Partial<DocumentItem>,
    _changeSummary?: string
  ): Promise<DocumentItem> {
    return requestQueue.enqueue(async () => {
      const payload: Record<string, any> = {
        id: documentId,
        updated_at: new Date().toISOString(),
      };

      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.doc_type !== undefined) payload.doc_type = updates.doc_type;
      if (updates.content !== undefined) payload.content = updates.content;

      // 1. Persist locally first for guaranteed UI responsiveness & offline capability
      try {
        const stored = localStorage.getItem(`bunker_doc_override_${documentId}`);
        const existing = stored ? JSON.parse(stored) : {};
        const updated = { ...existing, ...payload };
        localStorage.setItem(`bunker_doc_override_${documentId}`, JSON.stringify(updated));
      } catch {}

      // 2. Background sync attempt via upsert
      try {
        await supabase
          .from('documents')
          .upsert(payload, { onConflict: 'id', ignoreDuplicates: false });
      } catch (err) {
        console.warn('[DocumentRepository] Background upsert sync notice:', err);
      }

      const freshDoc = await DocumentRepository.getDocumentById(documentId);
      return freshDoc || (normalizeDocItem({ id: documentId, ...payload }));
    }, 'critical');
  },

  /**
   * Update Document Metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<DocumentItem>,
    changeSummary = 'Updated document content'
  ): Promise<DocumentItem> {
    return this.saveDocument(documentId, updates, changeSummary);
  },

  /**
   * Delete Document
   */
  async deleteDocument(documentId: string): Promise<void> {
    return requestQueue.enqueue(async () => {
      try {
        localStorage.removeItem(`bunker_doc_override_${documentId}`);
      } catch {}

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) console.warn('[DocumentRepository] Delete document warning:', error);
    }, 'critical');
  },

  /**
   * Toggle Favorite Status
   */
  async toggleFavorite(documentId: string, isFavorite: boolean): Promise<void> {
    return requestQueue.enqueue(async () => {
      try {
        const stored = localStorage.getItem(`bunker_doc_override_${documentId}`);
        const existing = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          `bunker_doc_override_${documentId}`,
          JSON.stringify({ ...existing, is_favorite: isFavorite })
        );
      } catch {}
    }, 'medium');
  },

  /**
   * Toggle Client Visibility Status
   */
  async toggleClientVisible(documentId: string, isClientVisible: boolean): Promise<void> {
    return requestQueue.enqueue(async () => {
      try {
        const stored = localStorage.getItem(`bunker_doc_override_${documentId}`);
        const existing = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          `bunker_doc_override_${documentId}`,
          JSON.stringify({ ...existing, is_client_visible: isClientVisible })
        );
      } catch {}
    }, 'medium');
  },

  /**
   * Restore Document to a Specific Historical Version
   */
  async restoreVersion(documentId: string, versionId: string): Promise<DocumentItem> {
    return requestQueue.enqueue(async () => {
      const { data: ver, error: verErr } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (verErr || !ver) throw verErr || new Error('Version snapshot not found.');

      return await DocumentRepository.saveDocument(
        documentId,
        { content: ver.content },
        `Restored from version v${ver.version_number}`
      );
    }, 'critical');
  },
};

export default DocumentRepository;
