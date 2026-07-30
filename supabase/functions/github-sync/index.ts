import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseRepositoryUrl } from './utils/parser.ts';
import { isCacheFresh } from './utils/cache.ts';
import { createErrorResponse, corsHeaders } from './utils/errors.ts';
import { getGithubClientHeaders } from './providers/octokit.ts';
import { mapReleaseData } from './mappers/release.mapper.ts';
import { mapRepositoryData } from './mappers/repository.mapper.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface SyncPayload {
  project_id?: string;
  projectId?: string;
  repoUrl?: string;
  force?: boolean;
}

serve(async (req: Request) => {
  const startTime = performance.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bodyText = await req.text();
    const body: SyncPayload = bodyText ? JSON.parse(bodyText) : {};

    const targetProjectId = body.project_id || body.projectId;
    const force = Boolean(body.force);

    if (!targetProjectId) {
      return createErrorResponse({
        code: 'INVALID_INPUT',
        message: 'A valid project_id UUID is required.',
        status: 400,
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch connected project & existing github_repositories cache record
    const [projectRes, existingRepoRes] = await Promise.all([
      supabaseAdmin.from('projects').select('id, name, thumbnail_url').eq('id', targetProjectId).maybeSingle(),
      supabaseAdmin.from('github_repositories').select('*').eq('project_id', targetProjectId).maybeSingle(),
    ]);

    if (projectRes.error || !projectRes.data) {
      return createErrorResponse({
        code: 'PROJECT_NOT_FOUND',
        message: `Project record ${targetProjectId} does not exist.`,
        status: 404,
      });
    }

    const existingRepo = existingRepoRes.data;

    // 2. Intelligent Cache Evaluation (5-minute TTL unless forced)
    if (!force && existingRepo && isCacheFresh(existingRepo.last_synced_at, 5)) {
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          message: 'Returned fresh cached repository metadata (synced < 5 minutes ago).',
          data: existingRepo,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 3. Resolve target repository URL
    const rawUrl = body.repoUrl || existingRepo?.repo_url || projectRes.data.thumbnail_url || '';
    const parsed = parseRepositoryUrl(rawUrl);

    if (!parsed) {
      return createErrorResponse({
        code: 'REPOSITORY_NOT_LINKED',
        message: 'No valid GitHub repository URL is attached to this project record.',
        status: 400,
      });
    }

    const headers = getGithubClientHeaders();
    const { owner, repo } = parsed;

    // 4. Fetch GitHub API resources (Max 6 parallel requests)
    const [repoRes, releasesRes, prsRes, commitsRes, langRes, runsRes, issuesRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=10`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=8`, { headers }),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return createErrorResponse({
          code: 'REPOSITORY_NOT_FOUND',
          message: `The linked GitHub repository (${owner}/${repo}) could not be found or access is forbidden.`,
          status: 404,
        });
      }
      return createErrorResponse({
        code: 'GITHUB_API_ERROR',
        message: `GitHub API returned error code ${repoRes.status}.`,
        status: repoRes.status,
      });
    }

    const repoData = await repoRes.json();
    const releasesData = releasesRes.ok ? await releasesRes.json() : [];
    const prsData = prsRes.ok ? await prsRes.json() : [];
    const commitsData = commitsRes.ok ? await commitsRes.json() : [];
    const langData = langRes.ok ? await langRes.json() : {};
    const runsData = runsRes.ok ? await runsRes.json() : { workflow_runs: [] };
    const issuesData = issuesRes.ok ? await issuesRes.json() : [];
    const contribData = contribRes.ok ? await contribRes.json() : [];

    // 5. Data Mapping
    const mappedRelease = mapReleaseData(releasesData);
    const { dbPayload, activityLogMetadata } = mapRepositoryData(
      targetProjectId,
      repoData,
      prsData,
      mappedRelease
    );

    // Formatted collections for UI
    const formattedCommits = Array.isArray(commitsData) ? commitsData.map((c: any) => ({
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit?.message,
      author: c.commit?.author?.name || c.author?.login,
      avatar: c.author?.avatar_url,
      date: c.commit?.author?.date,
      url: c.html_url,
    })) : [];

    const formattedPrs = Array.isArray(prsData) ? prsData.map((p: any) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      user: p.user?.login,
      avatar: p.user?.avatar_url,
      branch: p.head?.ref,
      url: p.html_url,
      createdAt: p.created_at,
    })) : [];

    const formattedWorkflows = Array.isArray(runsData.workflow_runs) ? runsData.workflow_runs.map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      headBranch: r.head_branch,
      commitMessage: r.head_commit?.message,
      url: r.html_url,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })) : [];

    const formattedIssues = Array.isArray(issuesData) ? issuesData.filter((i: any) => !i.pull_request).map((i: any) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      user: i.user?.login,
      url: i.html_url,
      createdAt: i.created_at,
    })) : [];

    const formattedContributors = Array.isArray(contribData) ? contribData.map((c: any) => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url,
    })) : [];

    // 6. Save into public.github_repositories
    let upsertData = null;
    let saveError = null;

    if (existingRepo) {
      const { data, error } = await supabaseAdmin
        .from('github_repositories')
        .update(dbPayload)
        .eq('id', existingRepo.id)
        .select()
        .single();
      upsertData = data;
      saveError = error;
    } else {
      const { data, error } = await supabaseAdmin
        .from('github_repositories')
        .insert(dbPayload)
        .select()
        .single();
      upsertData = data;
      saveError = error;
    }

    if (saveError) {
      console.error('[github-sync] Database save error:', saveError);
      return createErrorResponse({
        code: 'DATABASE_FAILURE',
        message: `Failed to save github_repositories record: ${saveError.message}`,
        status: 500,
      });
    }

    // 7. Insert Audit Trail into public.activity_logs
    try {
      await supabaseAdmin.from('activity_logs').insert({
        action: 'github_repository_synced',
        entity_type: 'github_repository',
        entity_id: upsertData?.id,
        metadata: activityLogMetadata,
      });
    } catch (logErr) {
      console.warn('[github-sync] Non-fatal log error:', logErr);
    }

    const duration = Math.round(performance.now() - startTime);

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        durationMs: duration,
        repository: upsertData,
        latestCommit: formattedCommits.length > 0 ? formattedCommits[0] : null,
        commits: formattedCommits,
        pullRequests: formattedPrs,
        workflows: formattedWorkflows,
        issues: formattedIssues,
        contributors: formattedContributors,
        languages: langData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('[github-sync] Fatal error:', err);
    return createErrorResponse({
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred during repository synchronization.',
      status: 500,
    });
  }
});
