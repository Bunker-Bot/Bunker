create table public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  content text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
