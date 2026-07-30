create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'admin'
    check (role in ('admin','owner')),
  created_at timestamptz not null default now()
);
