create table public.github_repositories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  repo_url text not null,
  organization text,
  branch text default 'main',
  visibility repo_visibility default 'private',
  latest_version text,
  latest_release text,
  open_issues integer default 0,
  open_prs integer default 0,
  last_synced_at timestamptz
);
