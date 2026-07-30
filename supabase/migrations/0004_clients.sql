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
