create table public.screenshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  title text,
  image_url text not null,
  sort_order integer not null default 0,
  taken_at timestamptz default now()
);
