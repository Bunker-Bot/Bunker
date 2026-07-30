import { supabase } from '../client';

export const BUCKET_NAME = 'project-thumbnails';

export const ProjectStorage = {
  /**
   * Upload thumbnail image to Supabase Storage
   */
  async uploadThumbnail(projectId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'webp';
    const filePath = `${projectId}/thumbnail_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[ProjectStorage] Upload error:', uploadError);
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Delete thumbnail image from Supabase Storage
   */
  async deleteThumbnail(fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    } catch (err) {
      console.warn('[ProjectStorage] Failed to delete previous thumbnail:', err);
    }
  },
};

export default ProjectStorage;
