-- ============================================================
-- 0034_phase15_changelog_notes_deployments.sql
-- PHASE 15: Changelog, Notes & Deployments Module Enhancements
-- ============================================================

-- 1. Changelog Entries Table Enhancements
ALTER TABLE public.changelog_entries
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Unique constraint per project version
CREATE UNIQUE INDEX IF NOT EXISTS idx_changelog_project_version
  ON public.changelog_entries(project_id, version);

CREATE INDEX IF NOT EXISTS idx_changelog_released_at
  ON public.changelog_entries(released_at DESC);

-- 2. Private Notes Table Enhancements
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_notes_project_id ON public.notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_notes_archived ON public.notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- ENSURE NOTES TABLE IS ABSOLUTELY ADMIN-ONLY (Zero viewer/portal RLS policies)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_access" ON public.notes;
CREATE POLICY "admin_full_access" ON public.notes
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Remove any legacy viewer policies on notes if any existed
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.notes;

-- 3. Deployments Table Enhancements
ALTER TABLE public.deployments
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS version text DEFAULT 'v1.0.0',
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_environment ON public.deployments(environment);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON public.deployments(deployed_at DESC);

-- Deployments RLS Policies
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_access" ON public.deployments;
CREATE POLICY "admin_full_access" ON public.deployments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "viewer_read_own_project" ON public.deployments;
CREATE POLICY "viewer_read_own_project" ON public.deployments
  FOR SELECT USING (public.is_project_viewer(project_id));
