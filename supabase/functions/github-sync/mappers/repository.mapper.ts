export interface MappedRepositoryPayload {
  dbPayload: {
    project_id: string;
    repo_url: string;
    organization: string | null;
    branch: string;
    visibility: 'public' | 'private';
    latest_version: string | null;
    latest_release: string | null;
    open_issues: number;
    open_prs: number;
    last_synced_at: string;
  };
  activityLogMetadata: {
    repository: string;
    branch: string;
    release: string | null;
    issues: number;
    pull_requests: number;
  };
}

export function mapRepositoryData(
  projectId: string,
  repoData: any,
  prsData: any[],
  releaseData: any | null
): MappedRepositoryPayload {
  const branch = repoData.default_branch || 'main';
  const visibility = repoData.private ? 'private' : 'public';
  const openIssuesCount = repoData.open_issues_count || 0;
  const openPrsCount = Array.isArray(prsData)
    ? prsData.filter((p: any) => p.state === 'open').length
    : 0;

  const latestReleaseTag = releaseData ? releaseData.tagName : null;

  return {
    dbPayload: {
      project_id: projectId,
      repo_url: repoData.html_url || `https://github.com/${repoData.full_name}`,
      organization: repoData.owner?.login || null,
      branch,
      visibility,
      latest_version: latestReleaseTag || 'v1.0.0',
      latest_release: latestReleaseTag,
      open_issues: openIssuesCount,
      open_prs: openPrsCount,
      last_synced_at: new Date().toISOString(),
    },
    activityLogMetadata: {
      repository: repoData.full_name,
      branch,
      release: latestReleaseTag,
      issues: openIssuesCount,
      pull_requests: openPrsCount,
    },
  };
}
