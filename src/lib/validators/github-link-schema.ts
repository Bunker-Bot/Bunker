import { z } from 'zod';

export const GITHUB_REPO_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)\/?$/;

export const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  const trimmed = url.trim().replace(/\/$/, '');
  const match = trimmed.match(GITHUB_REPO_URL_REGEX);
  if (!match) return null;
  return {
    owner: match[2],
    repo: match[3],
  };
};

export const githubLinkFormSchema = z.object({
  repo_url: z
    .string()
    .min(1, 'Repository URL is required')
    .refine(
      (val) => {
        const parsed = parseGithubUrl(val);
        return parsed !== null;
      },
      {
        message: 'Must be a valid GitHub repository URL (e.g. https://github.com/facebook/react)',
      }
    ),
  organization: z.string().optional().or(z.literal('')),
  branch: z.string().min(1, 'Default branch is required'),
  visibility: z.enum(['public', 'private']),
  display_name: z.string().optional().or(z.literal('')),
});

export type GithubLinkFormData = z.infer<typeof githubLinkFormSchema>;

export const sanitizeGithubData = (data: GithubLinkFormData) => {
  const parsed = parseGithubUrl(data.repo_url);
  return {
    repo_url: data.repo_url.trim().replace(/\/$/, ''),
    organization: data.organization?.trim() || parsed?.owner || null,
    branch: data.branch.trim() || 'main',
    visibility: data.visibility,
    display_name: data.display_name?.trim() || null,
  };
};
