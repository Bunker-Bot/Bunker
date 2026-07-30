-- ============================================================
-- 0035_phase16_settings_module.sql
-- PHASE 16: Settings Module RLS & Storage Statistics RPC
-- ============================================================

-- 1. Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_full_access" ON public.settings;
CREATE POLICY "admin_full_access" ON public.settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Create Storage & Account Statistics RPC
CREATE OR REPLACE FUNCTION public.get_storage_statistics()
RETURNS jsonb
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT jsonb_build_object(
    'total_projects', (SELECT count(*) FROM public.projects),
    'total_clients', (SELECT count(*) FROM public.clients),
    'total_share_links', (SELECT count(*) FROM public.share_links),
    'total_tasks', (SELECT count(*) FROM public.tasks),
    'total_notes', (SELECT count(*) FROM public.notes),
    'total_changelogs', (SELECT count(*) FROM public.changelog_entries),
    'total_deployments', (SELECT count(*) FROM public.deployments),
    'total_payments', (SELECT count(*) FROM public.project_payments),
    'total_deliverables', (SELECT count(*) FROM public.delivery_assets)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_storage_statistics() TO authenticated;
