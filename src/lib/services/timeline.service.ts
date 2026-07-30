import { TimelineRepository } from '../repositories/timeline.repository';
import type { TimelineFilterOptions } from '../repositories/timeline.repository';
import { supabase } from '../supabase/client';

/**
 * Data Normalization Helper for Timeline Updates
 */
function normalizeUpdatePayload<T extends { title?: string; description?: string }>(payload: T): T {
  const normalized = { ...payload };

  if (normalized.title) {
    normalized.title = normalized.title.trim().replace(/\s+/g, ' ');
  }

  if (normalized.description) {
    // Normalize line endings to \n and trim trailing whitespace from lines
    normalized.description = normalized.description
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  return normalized;
}

export const TimelineService = {
  async getUpdatesPaginated(options: TimelineFilterOptions) {
    try {
      return await TimelineRepository.getUpdatesPaginated(options);
    } catch (error: any) {
      console.error('[TimelineService] Failed to load timeline updates:', error);
      throw new Error('Unable to retrieve timeline history. Please refresh or try again.');
    }
  },

  async createUpdate(payload: {
    project_id: string;
    title: string;
    description?: string;
    entry_date?: string;
    attachments?: any[];
  }) {
    try {
      const normalizedPayload = normalizeUpdatePayload(payload);
      const result = await TimelineRepository.createUpdate(normalizedPayload);

      // Non-fatal audit log
      try {
        await supabase.from('activity_logs').insert({
          action: 'project_update_created',
          entity_type: 'project_update',
          entity_id: result.id,
          metadata: {
            project_id: payload.project_id,
            title: normalizedPayload.title,
            attachmentsCount: payload.attachments?.length || 0,
          },
        });
      } catch (logErr) {
        console.warn('[TimelineService] Non-fatal log error:', logErr);
      }

      return result;
    } catch (error: any) {
      console.error('[TimelineService] Failed to create timeline update:', error);
      throw new Error('Unable to publish the update. Please try again in a moment.');
    }
  },

  async updateUpdate(
    id: string,
    payload: {
      title?: string;
      description?: string;
      entry_date?: string;
      attachments?: any[];
    }
  ) {
    try {
      const normalizedPayload = normalizeUpdatePayload(payload);
      return await TimelineRepository.updateUpdate(id, normalizedPayload);
    } catch (error: any) {
      console.error(`[TimelineService] Failed to edit timeline update ${id}:`, error);
      throw new Error('Unable to save changes to the timeline update.');
    }
  },

  async deleteUpdate(id: string) {
    try {
      return await TimelineRepository.deleteUpdate(id);
    } catch (error: any) {
      console.error(`[TimelineService] Failed to delete timeline update ${id}:`, error);
      throw new Error('Unable to delete the timeline update.');
    }
  },
};

export default TimelineService;
