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
