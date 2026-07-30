create table public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version text not null,
  title text,
  description text,
  released_at date default current_date
);
