-- ProjectVault / Bunker Client Share Portal Security Architecture
-- Migration 0024: Zero-Trust RLS Policies & Access Audit Trail

-- 1. Add Access Audit Columns to share_links
ALTER TABLE public.share_links
ADD COLUMN IF NOT EXISTS last_access_at timestamptz,
ADD COLUMN IF NOT EXISTS last_ip text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. Explicit Viewer Read-Only RLS Policies
-- Only allowed tables get viewer policies scoped strictly by project_id match.

-- Projects
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.projects;
CREATE POLICY "viewer_read_own_project" ON public.projects
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = id
  );

-- Project Sections
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_sections;
CREATE POLICY "viewer_read_own_project" ON public.project_sections
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Project Technologies
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_technologies;
CREATE POLICY "viewer_read_own_project" ON public.project_technologies
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Milestones
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.milestones;
CREATE POLICY "viewer_read_own_project" ON public.milestones
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Project Updates / Timeline
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_updates;
CREATE POLICY "viewer_read_own_project" ON public.project_updates
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Screenshots
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.screenshots;
CREATE POLICY "viewer_read_own_project" ON public.screenshots
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Documents
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.documents;
CREATE POLICY "viewer_read_own_project" ON public.documents
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Deployments
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.deployments;
CREATE POLICY "viewer_read_own_project" ON public.deployments
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- GitHub Repositories Summary
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.github_repositories;
CREATE POLICY "viewer_read_own_project" ON public.github_repositories
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Changelog Entries
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.changelog_entries;
CREATE POLICY "viewer_read_own_project" ON public.changelog_entries
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- Shared Files
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.files;
CREATE POLICY "viewer_read_own_project" ON public.files
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'viewer' AND 
    (auth.jwt() ->> 'project_id')::uuid = project_id
  );

-- 3. FORBIDDEN TABLES FOR VIEWERS (Explicit Admin-Only RLS Enforcements)
-- profiles, clients, notes, tasks, task_attachments, activity_logs, settings, share_links
-- No viewer SELECT policies exist for these tables. Access will be rejected with RLS error 42501 by Postgres.
