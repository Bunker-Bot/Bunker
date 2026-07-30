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
