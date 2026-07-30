create table public.settings (
  key text primary key,
  value jsonb not null default '{}'
);
