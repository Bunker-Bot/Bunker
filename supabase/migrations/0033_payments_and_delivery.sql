-- ============================================================
-- 0033_payments_and_delivery.sql
-- Payment Tracking & Automated Deliverable Asset Unlocking Module
-- ============================================================

-- 0. Ensure budget column exists on projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS budget numeric(12,2) DEFAULT 0;

-- 1. Create project_payments table
CREATE TABLE IF NOT EXISTS public.project_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'INR',
  payment_method text NOT NULL DEFAULT 'Bank Transfer',
  transaction_id text,
  payment_date timestamptz NOT NULL DEFAULT now(),
  is_verified boolean NOT NULL DEFAULT true,
  notes text,
  invoice_url text,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create delivery_assets table
CREATE TABLE IF NOT EXISTS public.delivery_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  asset_type text NOT NULL DEFAULT 'google_drive',
  asset_url text NOT NULL,
  storage_path text,
  unlock_type text NOT NULL DEFAULT '100_percent',
  is_manual_unlocked boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_project_payments_project_id ON public.project_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_payments_date ON public.project_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_assets_project_id ON public.delivery_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assets_unlock_type ON public.delivery_assets(unlock_type);

-- 4. Helper function: Get total verified paid amount for a project
CREATE OR REPLACE FUNCTION public.get_project_paid_amount(p_project_id uuid)
RETURNS numeric
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.project_payments
  WHERE project_id = p_project_id
    AND is_verified = true;
$$;

-- 5. Helper function: Check if a delivery asset is unlocked
CREATE OR REPLACE FUNCTION public.is_asset_unlocked(
  p_unlock_type text,
  p_is_manual_unlocked boolean,
  p_project_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
  v_budget numeric := 0;
  v_paid numeric := 0;
  v_ratio numeric := 0;
BEGIN
  IF p_unlock_type = 'immediate' THEN
    RETURN true;
  END IF;

  IF p_unlock_type = 'manual' THEN
    RETURN COALESCE(p_is_manual_unlocked, false);
  END IF;

  -- Fetch project budget
  SELECT COALESCE(budget, 0) INTO v_budget
  FROM public.projects
  WHERE id = p_project_id;

  -- Fetch total paid
  v_paid := public.get_project_paid_amount(p_project_id);

  IF v_budget <= 0 THEN
    RETURN v_paid > 0;
  END IF;

  v_ratio := (v_paid / v_budget) * 100;

  IF p_unlock_type = '25_percent' THEN
    RETURN v_ratio >= 25;
  ELSIF p_unlock_type = '50_percent' THEN
    RETURN v_ratio >= 50;
  ELSIF p_unlock_type = '75_percent' THEN
    RETURN v_ratio >= 75;
  ELSIF p_unlock_type = '100_percent' THEN
    RETURN (v_budget - v_paid) <= 0 OR v_ratio >= 100;
  END IF;

  RETURN false;
END;
$$;

-- 6. Enable Row-Level Security
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assets ENABLE ROW LEVEL SECURITY;

-- 7. Admin Full Access Policies
DROP POLICY IF EXISTS "admin_project_payments_all" ON public.project_payments;
CREATE POLICY "admin_project_payments_all" ON public.project_payments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delivery_assets_all" ON public.delivery_assets;
CREATE POLICY "admin_delivery_assets_all" ON public.delivery_assets
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Viewer / Shared Portal Read Policies
DROP POLICY IF EXISTS "viewer_read_own_payments" ON public.project_payments;
CREATE POLICY "viewer_read_own_payments" ON public.project_payments
  FOR SELECT USING (
    public.is_project_viewer(project_id)
    OR EXISTS (
      SELECT 1 FROM public.share_links sl
      WHERE sl.project_id = project_payments.project_id
        AND sl.is_active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > now())
    )
  );

DROP POLICY IF EXISTS "viewer_read_unlocked_delivery_assets" ON public.delivery_assets;
CREATE POLICY "viewer_read_unlocked_delivery_assets" ON public.delivery_assets
  FOR SELECT USING (
    is_archived = false
    AND (
      public.is_project_viewer(project_id)
      OR EXISTS (
        SELECT 1 FROM public.share_links sl
        WHERE sl.project_id = delivery_assets.project_id
          AND sl.is_active = true
          AND (sl.expires_at IS NULL OR sl.expires_at > now())
      )
    )
    AND public.is_asset_unlocked(unlock_type, is_manual_unlocked, project_id) = true
  );

-- 9. Storage Buckets Initialization
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-invoices', 'project-invoices', true),
  ('project-receipts', 'project-receipts', true),
  ('project-deliverables', 'project-deliverables', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 10. Update get_portal_data RPC to return payment summary and delivery assets
CREATE OR REPLACE FUNCTION public.get_portal_data(p_token_hash text, p_raw_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link record;
  v_project jsonb;
  v_milestones jsonb;
  v_payments jsonb;
  v_assets jsonb;
  v_link_json jsonb;
BEGIN
  -- 1. Find the share link by token hash or raw token
  SELECT * INTO v_link
  FROM public.share_links
  WHERE token = p_token_hash
     OR (p_raw_token IS NOT NULL AND token = p_raw_token)
  LIMIT 1;

  IF v_link IS NULL THEN
    RETURN jsonb_build_object('error', 'INVALID_LINK');
  END IF;

  IF NOT v_link.is_active THEN
    RETURN jsonb_build_object('error', 'ACCESS_REVOKED');
  END IF;

  IF v_link.expires_at IS NOT NULL AND v_link.expires_at < now() THEN
    RETURN jsonb_build_object('error', 'LINK_EXPIRED');
  END IF;

  IF v_link.max_views IS NOT NULL AND v_link.view_count >= v_link.max_views THEN
    RETURN jsonb_build_object('error', 'LIMIT_EXCEEDED');
  END IF;

  -- 2. Increment view count atomically
  UPDATE public.share_links
  SET view_count = COALESCE(view_count, 0) + 1,
      last_access_at = now()
  WHERE id = v_link.id;

  v_link_json := jsonb_build_object(
    'id', v_link.id,
    'project_id', v_link.project_id,
    'is_active', v_link.is_active,
    'expires_at', v_link.expires_at,
    'max_views', v_link.max_views,
    'view_count', v_link.view_count,
    'password_hash', v_link.password_hash,
    'created_at', v_link.created_at
  );

  -- 3. Fetch project data
  SELECT to_jsonb(p.*) INTO v_project
  FROM public.projects p
  WHERE p.id = v_link.project_id;

  -- 4. Fetch milestones
  SELECT COALESCE(
    jsonb_agg(to_jsonb(m.*) ORDER BY m.sort_order ASC, m.created_at ASC),
    '[]'::jsonb
  ) INTO v_milestones
  FROM public.milestones m
  WHERE m.project_id = v_link.project_id;

  -- 5. Fetch verified payments
  SELECT COALESCE(
    jsonb_agg(to_jsonb(pay.*) ORDER BY pay.payment_date DESC),
    '[]'::jsonb
  ) INTO v_payments
  FROM public.project_payments pay
  WHERE pay.project_id = v_link.project_id AND pay.is_verified = true;

  -- 6. Fetch unlocked delivery assets
  SELECT COALESCE(
    jsonb_agg(to_jsonb(da.*) ORDER BY da.sort_order ASC, da.created_at DESC),
    '[]'::jsonb
  ) INTO v_assets
  FROM public.delivery_assets da
  WHERE da.project_id = v_link.project_id
    AND da.is_archived = false
    AND public.is_asset_unlocked(da.unlock_type, da.is_manual_unlocked, da.project_id) = true;

  -- 7. Return complete portal payload
  RETURN jsonb_build_object(
    'link', v_link_json,
    'project', COALESCE(v_project, '{}'::jsonb),
    'milestones', v_milestones,
    'payments', v_payments,
    'assets', v_assets
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_portal_data(text, text) TO anon, authenticated;
