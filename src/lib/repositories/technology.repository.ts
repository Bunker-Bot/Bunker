import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';
import { DEFAULT_POPULAR_TECHNOLOGIES } from '../constants/technology-icons';

export const TechnologyRepository = {
  /**
   * Fetch popular technologies catalog
   */
  async getPopularTechnologies(): Promise<string[]> {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('project_technologies')
        .select('name');

      if (error || !data || data.length === 0) {
        return DEFAULT_POPULAR_TECHNOLOGIES;
      }

      const names = Array.from(new Set(data.map((t) => t.name)));
      return names.length > 0 ? names : DEFAULT_POPULAR_TECHNOLOGIES;
    }, 'medium');
  },

  /**
   * Search technology suggestions
   */
  async searchTechnologies(query: string): Promise<string[]> {
    return requestQueue.enqueue(async () => {
      const cleanQuery = query.trim().toLowerCase();
      if (!cleanQuery) return DEFAULT_POPULAR_TECHNOLOGIES;

      const filteredDefaults = DEFAULT_POPULAR_TECHNOLOGIES.filter((t) =>
        t.toLowerCase().includes(cleanQuery)
      );

      const { data, error } = await supabase
        .from('project_technologies')
        .select('name')
        .ilike('name', `%${cleanQuery}%`)
        .limit(10);

      if (error || !data) return filteredDefaults;

      const dbNames = data.map((t) => t.name);
      return Array.from(new Set([...filteredDefaults, ...dbNames]));
    }, 'medium');
  },
};

export default TechnologyRepository;
