-- Migration 0029: Fix Public Client Share Portal RLS Helper Function
-- Allows reading projects, milestones, documents, timeline, and screenshots for active share links

CREATE OR REPLACE FUNCTION public.is_project_viewer(target_project uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.project_id = target_project
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
  )
  OR (
    (auth.jwt() ->> 'role') = 'viewer'
    AND (auth.jwt() ->> 'project_id')::uuid = target_project
  );
$$;

-- Ensure RLS Policies on public tables use public.is_project_viewer

-- 1. Projects
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.projects;
CREATE POLICY "viewer_read_own_project" ON public.projects
  FOR SELECT USING (public.is_project_viewer(id));

-- 2. Milestones
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.milestones;
CREATE POLICY "viewer_read_own_project" ON public.milestones
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 3. Project Sections
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_sections;
CREATE POLICY "viewer_read_own_project" ON public.project_sections
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 4. Project Technologies
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_technologies;
CREATE POLICY "viewer_read_own_project" ON public.project_technologies
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 5. Project Updates / Timeline
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.project_updates;
CREATE POLICY "viewer_read_own_project" ON public.project_updates
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 6. Screenshots
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.screenshots;
CREATE POLICY "viewer_read_own_project" ON public.screenshots
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 7. Documents
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.documents;
CREATE POLICY "viewer_read_own_project" ON public.documents
  FOR SELECT USING (public.is_project_viewer(project_id));

-- 8. Share Links Status Read Policy
DROP POLICY IF EXISTS "Public token access share_links" ON public.share_links;
CREATE POLICY "Public token access share_links" ON public.share_links
  FOR SELECT USING (true);
