create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  environment deployment_environment not null,
  frontend_url text,
  backend_url text,
  api_url text,
  admin_url text,
  portal_url text,
  deployed_at timestamptz default now()
);
