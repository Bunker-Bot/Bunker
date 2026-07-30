export interface ParsedGithubUrl {
  owner: string;
  repo: string;
  fullUrl: string;
}

export function parseRepositoryUrl(url: string): ParsedGithubUrl | null {
  if (!url) return null;
  const clean = url.trim().replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
  const parts = clean.split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;

  return {
    owner: parts[0],
    repo: parts[1],
    fullUrl: `https://github.com/${parts[0]}/${parts[1]}`,
  };
}
