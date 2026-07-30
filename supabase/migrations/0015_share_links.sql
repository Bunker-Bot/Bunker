create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text not null unique,
  password_hash text,
  expires_at timestamptz,
  is_active boolean not null default true,
  view_count integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
