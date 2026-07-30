import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GITHUB_TOKEN = Deno.env.get('GITHUB_PERSONAL_ACCESS_TOKEN') || Deno.env.get('GITHUB_TOKEN') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { owner, repo }: { owner: string; repo: string } = await req.json();
    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: 'owner and repo parameters are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Bunker-Platform',
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    // Parallel requests: Repo details & branches
    const [repoRes, branchesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=30`, { headers }),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return new Response(JSON.stringify({ error: 'Repository not found or access denied.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      const errText = await repoRes.text();
      return new Response(JSON.stringify({ error: `GitHub API error (${repoRes.status}): ${errText}` }), {
        status: repoRes.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const repoData = await repoRes.json();
    const branchesData = branchesRes.ok ? await branchesRes.json() : [];

    const branches = Array.isArray(branchesData)
      ? branchesData.map((b: any) => ({
          name: b.name,
          protected: b.protected || false,
        }))
      : [{ name: repoData.default_branch || 'main', protected: false }];

    const metadata = {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      owner: repoData.owner?.login,
      ownerAvatar: repoData.owner?.avatar_url,
      description: repoData.description || 'No repository description provided.',
      language: repoData.language || 'Unknown',
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      defaultBranch: repoData.default_branch || 'main',
      visibility: repoData.private ? 'private' : 'public',
      url: repoData.html_url,
      updatedAt: repoData.updated_at,
      branches,
    };

    return new Response(JSON.stringify({ valid: true, metadata }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (err: any) {
    console.error('[github-validate] Execution error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
