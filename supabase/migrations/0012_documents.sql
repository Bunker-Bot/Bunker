create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  doc_type text default 'readme',
  content text,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  version_number integer not null,
  created_at timestamptz not null default now()
);
