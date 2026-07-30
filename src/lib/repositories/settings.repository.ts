import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export const SettingsRepository = {
  async getSetting<T>(key: string): Promise<T | null> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('key', key)
        .maybeSingle();

      if (error || !data) return null;
      return data.value as T;
    }, 'low');
  },

  async updateSetting<T>(key: string, value: T) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value })
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'critical');
  },
};

export default SettingsRepository;
