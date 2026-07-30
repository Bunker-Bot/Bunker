import { GithubRepository } from '../repositories/github.repository';

export const GithubService = {
  async getGithubRepository(projectId: string) {
    try {
      return await GithubRepository.getGithubRepository(projectId);
    } catch (error: any) {
      console.error(`[GithubService] Failed to load cached repository for project ${projectId}:`, error);
      return null;
    }
  },

  async validateRepository(owner: string, repo: string) {
    try {
      return await GithubRepository.validateRepository(owner, repo);
    } catch (error: any) {
      console.error(`[GithubService] Failed to validate repository ${owner}/${repo}:`, error);
      throw new Error('Unable to validate the specified GitHub repository. Please verify repository existence and permissions.');
    }
  },

  async syncGithubRepository(projectId: string, repoUrl?: string, force = false) {
    try {
      return await GithubRepository.syncGithubRepository(projectId, repoUrl, force);
    } catch (error: any) {
      console.error(`[GithubService] Failed to sync repository for project ${projectId}:`, error);
      throw new Error('Unable to synchronize the repository. Please try again in a few moments.');
    }
  },
};

export default GithubService;
