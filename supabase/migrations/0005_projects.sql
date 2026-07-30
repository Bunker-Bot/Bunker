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
  completion_percent smallint not null default 0
    check (completion_percent between 0 and 100),
  color text default '#E11D48',
  thumbnail_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
