export interface ReleaseDTO {
  tagName: string;
  name: string;
  publishedAt: string;
  url: string;
  isDraft: boolean;
  isPrerelease: boolean;
}

export function mapReleaseData(releases: any[]): ReleaseDTO | null {
  if (!Array.isArray(releases) || releases.length === 0) return null;
  const rel = releases[0];
  return {
    tagName: rel.tag_name || 'v1.0.0',
    name: rel.name || rel.tag_name || 'Release',
    publishedAt: rel.published_at || new Date().toISOString(),
    url: rel.html_url || '',
    isDraft: Boolean(rel.draft),
    isPrerelease: Boolean(rel.prerelease),
  };
}
