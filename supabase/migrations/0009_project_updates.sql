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
