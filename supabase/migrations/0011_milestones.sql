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
