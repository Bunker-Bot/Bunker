-- Helper: is the current JWT an authenticated admin?
create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- Helper: does the current JWT carry a valid viewer scope for :project_id?
create or replace function public.is_project_viewer(target_project uuid)
returns boolean
language sql security definer stable
as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'viewer'
    and (auth.jwt() ->> 'project_id')::uuid = target_project,
    false
  );
$$;

-- Enable RLS and apply policies for projects
alter table public.projects enable row level security;

create policy "admin_full_access" on public.projects
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.projects
  for select using (is_project_viewer(id));

-- Enable RLS and apply policies for clients
alter table public.clients enable row level security;

create policy "admin_full_access" on public.clients
  for all using (is_admin()) with check (is_admin());

-- Enable RLS and apply policies for tasks
alter table public.tasks enable row level security;

create policy "admin_full_access" on public.tasks
  for all using (is_admin()) with check (is_admin());

-- Enable RLS and apply policies for milestones
alter table public.milestones enable row level security;

create policy "admin_full_access" on public.milestones
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.milestones
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for documents
alter table public.documents enable row level security;

create policy "admin_full_access" on public.documents
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.documents
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for files
alter table public.files enable row level security;

create policy "admin_full_access" on public.files
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.files
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for screenshots
alter table public.screenshots enable row level security;

create policy "admin_full_access" on public.screenshots
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.screenshots
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for changelog_entries
alter table public.changelog_entries enable row level security;

create policy "admin_full_access" on public.changelog_entries
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.changelog_entries
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for github_repositories
alter table public.github_repositories enable row level security;

create policy "admin_full_access" on public.github_repositories
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.github_repositories
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for project_updates
alter table public.project_updates enable row level security;

create policy "admin_full_access" on public.project_updates
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.project_updates
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for project_sections
alter table public.project_sections enable row level security;

create policy "admin_full_access" on public.project_sections
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.project_sections
  for select using (is_project_viewer(project_id));

-- Enable RLS and apply policies for deployments
alter table public.deployments enable row level security;

create policy "admin_full_access" on public.deployments
  for all using (is_admin()) with check (is_admin());

create policy "viewer_read_own_project" on public.deployments
  for select using (is_project_viewer(project_id));

-- Notes are never exposed to viewers — admin-only, no viewer policy exists
alter table public.notes enable row level security;

create policy "admin_full_access" on public.notes
  for all using (is_admin()) with check (is_admin());
