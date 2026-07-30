import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export const StorageRepository = {
  async getFilesByProject(projectId: string, folderId?: string) {
    return requestQueue.enqueue(async () => {
      let query = supabase
        .from('files')
        .select('id, project_id, folder_id, name, storage_path, size_bytes, mime_type, uploaded_by, uploaded_at')
        .eq('project_id', projectId);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      } else {
        query = query.is('folder_id', null);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }, 'medium');
  },

  async getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error) return null;
      return data.signedUrl;
    }, 'medium');
  },
};

export default StorageRepository;
