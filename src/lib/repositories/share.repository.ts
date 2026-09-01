import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export interface CreateShareLinkPayload {
  projectId: string;
  name?: string;
  expiresAt?: string | null;
  passwordHash?: string | null;
  maxViews?: number | null;
  permissions?: Record<string, boolean>;
  notes?: string | null;
}

export interface ShareLinkItem {
  id: string;
  project_id: string;
  name: string;
  token: string;
  password_hash?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  view_count: number;
  max_views?: number | null;
  permissions: Record<string, boolean>;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  last_access_at?: string | null;
  project?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
}

export interface ShareLinkEventItem {
  id: string;
  share_link_id: string;
  event_type: 'view' | 'password_verify' | 'download' | 'section_view';
  country?: string | null;
  city?: string | null;
  browser?: string | null;
  os?: string | null;
  device_type?: string | null;
  referrer?: string | null;
  created_at: string;
}

export const ShareRepository = {
  /**
   * Helper to generate a 32-byte (64 hex characters) cryptographically secure token
   */
  generateSecureToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Fetch all share links for a single project or all projects
   */
  async getShareLinks(projectId?: string): Promise<ShareLinkItem[]> {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('share_links')
        .select('*, project:projects(id, name, slug, color)')
        .order('created_at', { ascending: false });

      if (projectId && projectId !== 'all') {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as ShareLinkItem[];
    }, 'high');
  },

  /**
   * Fetch single share link by ID
   */
  async getShareLinkById(id: string): Promise<ShareLinkItem | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('share_links')
        .select('*, project:projects(id, name, slug, color)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return (data as unknown) as ShareLinkItem;
    }, 'high');
  },

  /**
   * Create new Share Link (Edge Function with direct repository fallback)
   */
  async createShareLink(payload: CreateShareLinkPayload): Promise<ShareLinkItem> {
    return requestQueue.enqueue(async () => {
      // 1. Try invoking Supabase Edge Function 'generate-share-link' if enabled
      if (import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true') {
        try {
          const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
            'generate-share-link',
            {
              body: {
                projectId: payload.projectId,
                name: payload.name,
                expiresAt: payload.expiresAt,
                passwordHash: payload.passwordHash,
                maxViews: payload.maxViews,
                allowedModules: payload.permissions
                  ? Object.keys(payload.permissions).filter((k) => payload.permissions![k])
                  : undefined,
                notes: payload.notes,
              },
            }
          );

          if (!edgeErr && edgeData?.id) {
            const fetched = await this.getShareLinkById(edgeData.id);
            if (fetched) {
              const rawToken = typeof edgeData.url === 'string'
                ? edgeData.url.split('/s/')[1]?.split(/[?#]/)[0]
                : undefined;
              return rawToken ? { ...fetched, token: decodeURIComponent(rawToken) } : fetched;
            }
          }
        } catch (_edgeFailed) {
          // Fallback to direct DB insert
        }
      }

      // 2. Direct Repository Fallback
      const token = this.generateSecureToken();
      const tokenHashBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
      const tokenHash = Array.from(new Uint8Array(tokenHashBytes)).map((b) => b.toString(16).padStart(2, '0')).join('');
      const insertPayload: Record<string, any> = {
        project_id: payload.projectId,
        name: payload.name || 'Client Review',
        token: tokenHash,
        expires_at: payload.expiresAt || null,
        password_hash: payload.passwordHash || null,
        max_views: payload.maxViews || null,
        permissions: payload.permissions || {
          overview: true,
          timeline: true,
          milestones: true,
          screenshots: true,
          documents: true,
          files: true,
          deployments: true,
          github: true,
          changelog: true,
        },
      };

      if (payload.notes) {
        insertPayload.notes = payload.notes;
      }

      let { data, error } = await supabase
        .from('share_links')
        .insert(insertPayload)
        .select('*, project:projects(id, name, slug, color)')
        .single();

      // Fallback if 'notes' column does not exist on remote DB table yet
      if (error && (error.code === 'PGRST204' || error.message?.includes('notes')) && insertPayload.notes) {
        delete insertPayload.notes;
        const retryResult = await supabase
          .from('share_links')
          .insert(insertPayload)
          .select('*, project:projects(id, name, slug, color)')
          .single();

        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) throw error;
      return { ...((data as unknown) as ShareLinkItem), token };
    }, 'critical');
  },

  /**
   * Regenerate Token for existing Share Link (Invalidates previous token)
   */
  async regenerateShareLinkToken(id: string): Promise<ShareLinkItem> {
    return requestQueue.enqueue(async () => {
      const newToken = this.generateSecureToken();
      const hashBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newToken));
      const newTokenHash = Array.from(new Uint8Array(hashBytes)).map((b) => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from('share_links')
        .update({ token: newTokenHash })
        .eq('id', id)
        .select('*, project:projects(id, name, slug, color)')
        .single();

      if (error) throw error;
      return { ...((data as unknown) as ShareLinkItem), token: newToken };
    }, 'critical');
  },

  /**
   * Toggle Active / Disabled Status
   */
  async toggleShareLinkStatus(id: string, isActive: boolean): Promise<ShareLinkItem> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('share_links')
        .update({ is_active: isActive })
        .eq('id', id)
        .select('*, project:projects(id, name, slug, color)')
        .single();

      if (error) throw error;
      return (data as unknown) as ShareLinkItem;
    }, 'critical');
  },

  /**
   * Update Share Link settings (permissions, expiration, maxViews, etc.)
   */
  async updateShareLink(
    id: string,
    updates: Partial<CreateShareLinkPayload & { is_active?: boolean }>
  ): Promise<ShareLinkItem> {
    return requestQueue.enqueue(async () => {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.expiresAt !== undefined) payload.expires_at = updates.expiresAt;
      if (updates.passwordHash !== undefined) payload.password_hash = updates.passwordHash;
      if (updates.maxViews !== undefined) payload.max_views = updates.maxViews;
      if (updates.permissions !== undefined) payload.permissions = updates.permissions;
      if (updates.is_active !== undefined) payload.is_active = updates.is_active;

      const { data, error } = await supabase
        .from('share_links')
        .update(payload)
        .eq('id', id)
        .select('*, project:projects(id, name, slug, color)')
        .single();

      if (error) throw error;
      return (data as unknown) as ShareLinkItem;
    }, 'critical');
  },

  /**
   * Delete / Revoke Share Link
   */
  async deleteShareLink(id: string): Promise<boolean> {
    return requestQueue.enqueue(async () => {
      const { error } = await supabase.from('share_links').delete().eq('id', id);
      if (error) throw error;
      return true;
    }, 'critical');
  },

  /**
   * Fetch Analytics events for a specific share link
   */
  async getShareLinkAnalytics(shareLinkId: string): Promise<ShareLinkEventItem[]> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('share_link_events')
        .select('*')
        .eq('share_link_id', shareLinkId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown) as ShareLinkEventItem[];
    }, 'medium');
  },

  /**
   * Fetch Overall Analytics for all links or a project's links
   */
  async getOverallAnalytics(projectId?: string): Promise<ShareLinkEventItem[]> {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('share_link_events')
        .select('*, share_link:share_links(project_id)')
        .order('created_at', { ascending: false })
        .limit(500);

      const { data, error } = await query;
      if (error) throw error;

      let events = (data as unknown) as (ShareLinkEventItem & { share_link?: { project_id: string } })[];
      if (projectId && projectId !== 'all') {
        events = events.filter((e) => e.share_link?.project_id === projectId);
      }

      return events;
    }, 'low');
  },

  /**
   * Record a view event with browser, OS, and device metadata
   */
  async recordShareLinkView(shareLinkId: string): Promise<void> {
    if (!shareLinkId) return;
    try {
      const { detectClientDeviceMetadata } = await import('../utils/browser-detector');
      const meta = detectClientDeviceMetadata();

      // Try RPC first
      const { error: rpcErr } = await supabase.rpc('record_share_link_view', {
        p_share_link_id: shareLinkId,
        p_browser: meta.browser,
        p_os: meta.os,
        p_device_type: meta.deviceType,
        p_country: meta.country,
      });

      if (rpcErr) {
        // Direct table insert fallback
        await supabase.from('share_link_events').insert({
          share_link_id: shareLinkId,
          event_type: 'view',
          browser: meta.browser,
          os: meta.os,
          device_type: meta.deviceType,
          country: meta.country,
        });

        // Sync view_count on share_links
        const { data: current } = await supabase
          .from('share_links')
          .select('view_count')
          .eq('id', shareLinkId)
          .single();

        await supabase
          .from('share_links')
          .update({
            view_count: (current?.view_count || 0) + 1,
            last_access_at: new Date().toISOString(),
          })
          .eq('id', shareLinkId);
      }
    } catch (_e) {}
  },
};

export default ShareRepository;
