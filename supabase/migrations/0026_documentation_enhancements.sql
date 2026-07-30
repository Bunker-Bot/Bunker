-- Migration 0026: Project Documentation Enhancements & Strict Client Visibility RLS

-- 1. Extend public.documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS author text DEFAULT 'Administrator',
ADD COLUMN IF NOT EXISTS is_client_visible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 2. Extend public.document_versions table
ALTER TABLE public.document_versions
ADD COLUMN IF NOT EXISTS change_summary text DEFAULT 'Updated document content',
ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'Administrator';

-- 3. Indexes for fast category, project, and search queries
CREATE INDEX IF NOT EXISTS idx_documents_project_category ON public.documents(project_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_project_client_visible ON public.documents(project_id, is_client_visible);
CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON public.document_versions(document_id, version_number DESC);

-- 4. Enable RLS on document_versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies for Documents and Document Versions
DROP POLICY IF EXISTS "viewer_read_own_project" ON public.documents;
DROP POLICY IF EXISTS "viewer_read_own_project_client_visible" ON public.documents;

CREATE POLICY "viewer_read_own_project_client_visible" ON public.documents
  FOR SELECT USING (
    is_project_viewer(project_id) AND is_client_visible = true
  );

DROP POLICY IF EXISTS "admin_full_access" ON public.document_versions;
DROP POLICY IF EXISTS "viewer_read_own_project_versions" ON public.document_versions;

CREATE POLICY "admin_full_access" ON public.document_versions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "viewer_read_own_project_versions" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_versions.document_id
        AND is_project_viewer(d.project_id)
        AND d.is_client_visible = true
    )
  );
