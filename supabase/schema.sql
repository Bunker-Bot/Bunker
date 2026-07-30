-- ====================================================================
-- PROJECT VAULT / BUNKER — COMPLETE SINGLE-OWNER ENTERPRISE POSTGRES SCHEMA
-- Pure Production Schema — 0 Mock/Dummy Data
-- Configured with Auto-Recalculation Triggers, Realtime Publications, and RLS
-- Suitable for execution directly inside Supabase SQL Editor
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------
-- 2. ENUM TYPES
-- --------------------------------------------------------------------
create type project_status as enum
  ('planning','active','on_hold','completed','cancelled');
create type project_priority as enum
  ('low','medium','high','urgent');
create type task_status as enum
  ('todo','in_progress','review','testing','completed');
create type deployment_environment as enum
  ('local','development','staging','production');
create type repo_visibility as enum ('public','private');

-- --------------------------------------------------------------------
-- 3. MASTER TABLES
-- --------------------------------------------------------------------

-- Profiles (Single Owner Admin)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'admin' check (role in ('admin','owner')),
  created_at timestamptz not null default now()
);

-- Clients (Managed exclusively by Admin)
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id),
  name text not null,
  company text,
  email text,
  phone text,
  country text,
  timezone text,
  website text,
  notes text,
  github_username text,
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  status project_status not null default 'planning',
  priority project_priority not null default 'medium',
  start_date date,
  deadline date,
  completion_percent smallint not null default 0 check (completion_percent between 0 and 100),
  color text default '#E11D48',
  thumbnail_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Project Technologies
create table public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  icon_url text
);

-- Project Sections
create table public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  sort_order smallint not null default 0,
  content text
);

-- GitHub Repositories
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

-- Project Updates / Timeline
create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  entry_date date not null default current_date,
  attachments jsonb not null default '[]',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Tasks & Task Attachments
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  module text,
  priority project_priority not null default 'medium',
  status task_status not null default 'todo',
  due_date date,
  progress smallint default 0 check (progress between 0 and 100),
  labels text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

-- Milestones & Milestone Attachments
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  progress smallint default 0 check (progress between 0 and 100),
  notes text,
  due_date date,
  completion_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.milestone_attachments (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  file_url text not null,
  file_name text not null
);

-- Documents & Document Versions
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  doc_type text default 'readme',
  content text,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  version_number integer not null,
  created_at timestamptz not null default now()
);

-- Folders & Files
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  name text not null,
  storage_path text not null,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now()
);

-- Screenshots
create table public.screenshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text,
  image_url text not null,
  sort_order integer not null default 0,
  taken_at timestamptz default now()
);

-- Share Links
create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text not null unique,
  name text default 'Client Review',
  password_hash text,
  expires_at timestamptz,
  is_active boolean not null default true,
  max_views integer default null,
  view_count integer not null default 0,
  unique_visitors integer default 0,
  total_downloads integer default 0,
  permissions jsonb default '{"overview": true, "timeline": true, "milestones": true, "screenshots": true, "documents": true, "files": true, "deployments": true, "github": true, "changelog": true}',
  last_access_at timestamptz,
  last_ip text,
  user_agent text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Share Link Events Tracking
create table public.share_link_events (
  id uuid primary key default gen_random_uuid(),
  share_link_id uuid not null references public.share_links(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'password_verify', 'download', 'section_view')),
  country text,
  city text,
  browser text,
  os text,
  device_type text,
  referrer text,
  created_at timestamptz default now()
);

-- Changelog Entries
create table public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version text not null,
  title text,
  description text,
  released_at date default current_date
);

-- Notes (Private Admin Notes)
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  content text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Deployments
create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  environment deployment_environment not null,
  frontend_url text,
  backend_url text,
  api_url text,
  admin_url text,
  portal_url text,
  deployed_at timestamptz default now()
);

-- Tags & Project Tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text default '#71717A'
);

create table public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- Activity Logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Settings
create table public.settings (
  key text primary key,
  value jsonb not null default '{}'
);

-- --------------------------------------------------------------------
-- 4. AUTOMATIC POSTGRES TRIGGERS
-- --------------------------------------------------------------------

-- Trigger 1: Auto-update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at before update on public.clients for each row execute function public.handle_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects for each row execute function public.handle_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.handle_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents for each row execute function public.handle_updated_at();

-- Trigger 2: Auto-recalculate project completion_percent from milestones
create or replace function public.recalculate_project_completion()
returns trigger
language plpgsql
as $$
declare
  v_project_id uuid;
  v_avg_progress smallint;
begin
  v_project_id := coalesce(new.project_id, old.project_id);

  select coalesce(avg(progress)::smallint, 0)
  into v_avg_progress
  from public.milestones
  where project_id = v_project_id;

  update public.projects
  set completion_percent = v_avg_progress,
      updated_at = now()
  where id = v_project_id;

  return new;
end;
$$;

drop trigger if exists sync_milestone_project_completion on public.milestones;
create trigger sync_milestone_project_completion
  after insert or update or delete on public.milestones
  for each row execute function public.recalculate_project_completion();

-- Trigger 3: Single-Admin onboarding trigger
create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'admin'
  )
  on conflict (id) do update set
    email = excluded.email,
    role = 'admin';
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();

-- --------------------------------------------------------------------
-- 5. REALTIME PUBLICATIONS
-- --------------------------------------------------------------------
-- Enables Supabase Realtime broadcasting for active tables
drop publication if exists supabase_realtime;
create publication supabase_realtime for table 
  public.projects, 
  public.milestones, 
  public.tasks, 
  public.documents, 
  public.files, 
  public.project_updates, 
  public.screenshots;

-- --------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE B-TREE INDEXES
-- --------------------------------------------------------------------
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_priority on public.projects(priority);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_deadline on public.projects(deadline);
create index if not exists idx_projects_created_by on public.projects(created_by);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_created_at_desc on public.projects(created_at desc);

create index if not exists idx_tasks_project_id_status on public.tasks(project_id, status);
create index if not exists idx_tasks_project_id_sort on public.tasks(project_id, sort_order);
create index if not exists idx_tasks_project_id_due on public.tasks(project_id, due_date);

create index if not exists idx_milestones_project_id on public.milestones(project_id);
create index if not exists idx_milestones_project_id_sort on public.milestones(project_id, sort_order);

create index if not exists idx_activity_logs_created_at_desc on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_actor_id on public.activity_logs(actor_id);
create index if not exists idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);

create index if not exists idx_share_links_token on public.share_links(token);
create index if not exists idx_share_links_project_id on public.share_links(project_id);
create index if not exists idx_share_links_active_expires on public.share_links(is_active, expires_at);

create index if not exists idx_share_link_events_link_id on public.share_link_events(share_link_id);
create index if not exists idx_share_link_events_created on public.share_link_events(created_at desc);

-- --------------------------------------------------------------------
-- 7. RLS SECURITY HELPER FUNCTIONS
-- --------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

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

-- --------------------------------------------------------------------
-- 8. ENABLE ROW LEVEL SECURITY & APPLY POLICIES
-- --------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_technologies enable row level security;
alter table public.project_sections enable row level security;
alter table public.github_repositories enable row level security;
alter table public.project_updates enable row level security;
alter table public.tasks enable row level security;
alter table public.task_attachments enable row level security;
alter table public.milestones enable row level security;
alter table public.milestone_attachments enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.screenshots enable row level security;
alter table public.share_links enable row level security;
alter table public.share_link_events enable row level security;
alter table public.changelog_entries enable row level security;
alter table public.notes enable row level security;
alter table public.deployments enable row level security;
alter table public.tags enable row level security;
alter table public.project_tags enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;

-- Single Admin Owner Full Access Policies
create policy "admin_full_access" on public.profiles for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.clients for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.projects for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.project_technologies for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.project_sections for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.github_repositories for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.project_updates for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.tasks for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.task_attachments for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.milestones for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.milestone_attachments for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.documents for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.document_versions for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.folders for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.files for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.screenshots for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.share_links for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.share_link_events for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.changelog_entries for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.notes for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.deployments for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.tags for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.project_tags for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.activity_logs for all using (is_admin()) with check (is_admin());
create policy "admin_full_access" on public.settings for all using (is_admin()) with check (is_admin());

-- Client Portal Read-Only Policies
create policy "viewer_read_own_project" on public.projects for select using (is_project_viewer(id));
create policy "viewer_read_own_project" on public.project_sections for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.project_technologies for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.milestones for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.project_updates for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.screenshots for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.documents for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.deployments for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.github_repositories for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.changelog_entries for select using (is_project_viewer(project_id));
create policy "viewer_read_own_project" on public.files for select using (is_project_viewer(project_id));

-- --------------------------------------------------------------------
-- 9. ENTERPRISE RPC FUNCTIONS
-- --------------------------------------------------------------------

-- Dashboard Summary RPC (1 request instead of 15 queries)
create or replace function public.get_dashboard_summary()
returns jsonb
language plpgsql
security definer
stable
as $$
declare
    v_total_projects int;
    v_active_projects int;
    v_completed_projects int;
    v_total_clients int;
    v_recent_projects jsonb;
    v_recent_activity jsonb;
begin
    if not public.is_admin() then
        raise exception 'Access denied. Admin credentials required.';
    end if;

    select count(*) into v_total_projects from public.projects;
    select count(*) into v_active_projects from public.projects where status in ('planning', 'active');
    select count(*) into v_completed_projects from public.projects where status = 'completed';
    select count(*) into v_total_clients from public.clients;

    select coalesce(jsonb_agg(p), '[]'::jsonb) into v_recent_projects
    from (
        select id, name, slug, status, completion_percent as progress, deadline, created_at
        from public.projects
        order by created_at desc
        limit 5
    ) p;

    select coalesce(jsonb_agg(a), '[]'::jsonb) into v_recent_activity
    from (
        select id, action, entity_type, entity_id, created_at
        from public.activity_logs
        order by created_at desc
        limit 10
    ) a;

    return jsonb_build_object(
        'projectCount', v_total_projects,
        'activeProjects', v_active_projects,
        'completedProjects', v_completed_projects,
        'clientCount', v_total_clients,
        'recentProjects', v_recent_projects,
        'recentActivity', v_recent_activity
    );
end;
$$;

-- Project Overview RPC
create or replace function public.get_project_overview(target_project uuid)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
    v_project jsonb;
    v_milestones jsonb;
    v_task_counts jsonb;
begin
    if not (public.is_admin() or public.is_project_viewer(target_project)) then
        raise exception 'Access denied for project %', target_project;
    end if;

    select row_to_json(p)::jsonb into v_project
    from public.projects p
    where p.id = target_project;

    if v_project is null then
        return null;
    end if;

    select coalesce(jsonb_agg(m), '[]'::jsonb) into v_milestones
    from (
        select id, name, progress, due_date, sort_order
        from public.milestones
        where project_id = target_project
        order by sort_order asc
    ) m;

    select jsonb_build_object(
        'todo', count(*) filter (where status = 'todo'),
        'in_progress', count(*) filter (where status = 'in_progress'),
        'review', count(*) filter (where status = 'review'),
        'testing', count(*) filter (where status = 'testing'),
        'completed', count(*) filter (where status = 'completed')
    ) into v_task_counts
    from public.tasks
    where project_id = target_project;

    return jsonb_build_object(
        'project', v_project,
        'milestones', v_milestones,
        'taskCounts', v_task_counts
    );
end;
$$;

-- Global Unified Search RPC
create or replace function public.search_everything(search_term text)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
    v_projects jsonb;
    v_clients jsonb;
    v_tasks jsonb;
begin
    if not public.is_admin() then
        raise exception 'Access denied.';
    end if;

    select coalesce(jsonb_agg(p), '[]'::jsonb) into v_projects
    from (
        select id, name, slug, status, 'project' as type
        from public.projects
        where name ilike '%' || search_term || '%' or description ilike '%' || search_term || '%'
        limit 5
    ) p;

    select coalesce(jsonb_agg(c), '[]'::jsonb) into v_clients
    from (
        select id, name, company, email, 'client' as type
        from public.clients
        where name ilike '%' || search_term || '%' or company ilike '%' || search_term || '%'
        limit 5
    ) c;

    select coalesce(jsonb_agg(t), '[]'::jsonb) into v_tasks
    from (
        select id, project_id, title, status, 'task' as type
        from public.tasks
        where title ilike '%' || search_term || '%'
        limit 5
    ) t;

    return jsonb_build_object(
        'projects', v_projects,
        'clients', v_clients,
        'tasks', v_tasks
    );
end;
$$;
