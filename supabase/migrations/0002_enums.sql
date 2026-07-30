create type project_status as enum
  ('planning','active','on_hold','completed','cancelled');
create type project_priority as enum
  ('low','medium','high','urgent');
create type task_status as enum
  ('todo','in_progress','review','testing','completed');
create type deployment_environment as enum
  ('local','development','staging','production');
create type repo_visibility as enum ('public','private');
