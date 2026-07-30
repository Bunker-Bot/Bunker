import { supabase } from '../supabase/client';
import { requestQueue } from '../utils/request-queue';

export const GithubRepository = {
  /**
   * Fetch cached github_repositories record from Supabase by project_id
   */
  async getGithubRepository(projectId: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('id, project_id, repo_url, organization, branch, visibility, latest_version, latest_release, open_issues, open_prs, last_synced_at')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }, 'medium');
  },

  /**
   * Validate repository server-side via github-validate Edge Function
   */
  async validateRepository(owner: string, repo: string) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.functions.invoke('github-validate', {
        body: { owner, repo },
      });

      if (error) throw error;
      return data;
    }, 'high');
  },

  /**
   * Invoke github-sync Edge Function to sync live GitHub API data
   */
  async syncGithubRepository(projectId: string, repoUrl?: string, force = false) {
    return requestQueue.enqueue(async () => {
      const { data, error } = await supabase.functions.invoke('github-sync', {
        body: { project_id: projectId, repoUrl, force },
      });

      if (error) throw error;
      return data;
    }, 'critical');
  },
};

export default GithubRepository;
