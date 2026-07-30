create table public.folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete set null,
  name text not null,
  storage_path text not null,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz not null default now()
);
