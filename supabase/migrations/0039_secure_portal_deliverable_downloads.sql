-- Migration 0039: Server-Side Strict Backend Payment Verification for Deliverables & Downloads
-- Prevents DevTools / client-side tampering by enforcing 100% payment verification directly in PostgreSQL.

-- 1. Helper function to compute verified paid amount on the backend
CREATE OR REPLACE FUNCTION public.get_project_paid_amount(p_project_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_paid numeric := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.project_payments
  WHERE project_id = p_project_id
    AND is_verified = true;
  RETURN v_paid;
END;
$$;

-- 2. Strict Backend Unlock Evaluator: MUST BE 100% FULLY PAID in PostgreSQL
CREATE OR REPLACE FUNCTION public.is_asset_unlocked(
  p_unlock_type text,
  p_is_manual_unlocked boolean,
  p_project_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_budget numeric := 0;
  v_paid numeric := 0;
BEGIN
  -- Admin manual unlock overrides payment rules
  IF COALESCE(p_is_manual_unlocked, false) = true THEN
    RETURN true;
  END IF;

  IF p_unlock_type = 'manual' THEN
    RETURN false;
  END IF;

  -- Fetch project budget directly from database table
  SELECT COALESCE(budget, 0) INTO v_budget
  FROM public.projects
  WHERE id = p_project_id;

  -- Fetch total verified paid amount directly from database table
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.project_payments
  WHERE project_id = p_project_id
    AND is_verified = true;

  -- STRICT SERVER-SIDE CHECK: Total amount must be 100% fully cleared
  IF v_budget > 0 THEN
    RETURN v_paid >= v_budget;
  ELSE
    RETURN v_paid > 0;
  END IF;
END;
$$;

-- 3. Strict Row Level Security Policies on delivery_assets
ALTER TABLE public.delivery_assets ENABLE ROW LEVEL SECURITY;

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

-- 4. Server-Side RPC for fetching single signed deliverable link
CREATE OR REPLACE FUNCTION public.get_secure_deliverable_url(
  p_token text,
  p_asset_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link record;
  v_asset record;
  v_budget numeric := 0;
  v_paid numeric := 0;
  v_is_unlocked boolean := false;
BEGIN
  -- Find and validate share link
  SELECT * INTO v_link
  FROM public.share_links
  WHERE (token = p_token OR token = encode(digest(p_token, 'sha256'), 'hex'))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF v_link IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_OR_EXPIRED_LINK');
  END IF;

  -- Find asset
  SELECT * INTO v_asset
  FROM public.delivery_assets
  WHERE id = p_asset_id AND project_id = v_link.project_id AND is_archived = false
  LIMIT 1;

  IF v_asset IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ASSET_NOT_FOUND');
  END IF;

  -- Verify backend payment strictly
  SELECT COALESCE(budget, 0) INTO v_budget
  FROM public.projects
  WHERE id = v_link.project_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.project_payments
  WHERE project_id = v_link.project_id AND is_verified = true;

  IF COALESCE(v_asset.is_manual_unlocked, false) = true THEN
    v_is_unlocked := true;
  ELSIF v_budget > 0 THEN
    v_is_unlocked := (v_paid >= v_budget);
  ELSE
    v_is_unlocked := (v_paid > 0);
  END IF;

  IF NOT v_is_unlocked THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PAYMENT_REQUIRED',
      'message', 'Project balance must be 100% fully cleared before downloading deliverable packages.'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'asset_id', v_asset.id,
    'title', v_asset.title,
    'asset_url', v_asset.asset_url,
    'storage_path', v_asset.storage_path
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_secure_deliverable_url(text, uuid) TO anon, authenticated;

-- 5. Ultra-Secure get_portal_data RPC (Never returns asset_url to client if unpaid)
CREATE OR REPLACE FUNCTION public.get_portal_data(p_token_hash text, p_raw_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link record;
  v_link_jsonb jsonb;
  v_project jsonb;
  v_milestones jsonb;
  v_payments jsonb;
  v_assets jsonb;
  v_github jsonb;
  v_docs jsonb;
  v_timeline jsonb;
  v_techs jsonb;
  v_link_json jsonb;
  v_allowed jsonb;
  v_proj_id uuid;
  v_total_budget numeric := 0;
  v_total_paid numeric := 0;
  v_is_fully_paid boolean := false;
BEGIN
  -- 1. Locate share link record
  SELECT * INTO v_link
  FROM public.share_links
  WHERE token = p_token_hash
     OR (p_raw_token IS NOT NULL AND token = p_raw_token)
  LIMIT 1;

  IF v_link IS NULL THEN
    RETURN jsonb_build_object('error', 'INVALID_LINK');
  END IF;

  v_link_jsonb := to_jsonb(v_link);

  IF COALESCE((v_link_jsonb->>'is_active')::boolean, true) = false THEN
    RETURN jsonb_build_object('error', 'ACCESS_REVOKED');
  END IF;

  IF v_link_jsonb->>'expires_at' IS NOT NULL AND (v_link_jsonb->>'expires_at')::timestamptz < now() THEN
    RETURN jsonb_build_object('error', 'LINK_EXPIRED');
  END IF;

  IF v_link_jsonb->>'max_views' IS NOT NULL AND COALESCE((v_link_jsonb->>'view_count')::integer, 0) >= (v_link_jsonb->>'max_views')::integer THEN
    RETURN jsonb_build_object('error', 'LIMIT_EXCEEDED');
  END IF;

  -- 2. Increment view count
  BEGIN
    UPDATE public.share_links
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = v_link.id;
  EXCEPTION WHEN OTHERS THEN
  END;

  -- 3. Allowed modules
  v_allowed := COALESCE(
    v_link_jsonb->'permissions',
    v_link_jsonb->'allowed_modules',
    '["overview","timeline","documentation","github","finance","deliverables","downloads"]'::jsonb
  );

  v_link_json := jsonb_build_object(
    'id', v_link_jsonb->>'id',
    'project_id', v_link_jsonb->>'project_id',
    'name', COALESCE(v_link_jsonb->>'name', 'Shared Project'),
    'is_active', COALESCE((v_link_jsonb->>'is_active')::boolean, true),
    'expires_at', v_link_jsonb->>'expires_at',
    'max_views', v_link_jsonb->>'max_views',
    'view_count', COALESCE((v_link_jsonb->>'view_count')::integer, 0),
    'password_hash', v_link_jsonb->>'password_hash',
    'permissions', v_allowed,
    'allowed_modules', v_allowed,
    'client_name', COALESCE(v_link_jsonb->>'client_name', ''),
    'created_at', v_link_jsonb->>'created_at'
  );

  v_proj_id := (v_link_jsonb->>'project_id')::uuid;

  -- 4. Fetch Project with Client Information
  BEGIN
    SELECT jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'slug', p.slug,
      'description', p.description,
      'status', p.status,
      'priority', p.priority,
      'start_date', p.start_date,
      'deadline', p.deadline,
      'due_date', COALESCE(p.deadline, p.start_date),
      'completion_percent', p.completion_percent,
      'color', p.color,
      'budget', p.budget,
      'cost', p.budget,
      'amount', p.budget,
      'client_id', p.client_id,
      'client_name', COALESCE(NULLIF(v_link_jsonb->>'client_name', ''), NULLIF(c.name, ''), NULLIF(c.company, ''), 'Valued Client'),
      'client', CASE WHEN c.id IS NOT NULL THEN jsonb_build_object('id', c.id, 'name', c.name, 'company', c.company, 'email', c.email) ELSE NULL END,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    ) INTO v_project
    FROM public.projects p
    LEFT JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = v_proj_id;

    v_total_budget := COALESCE((v_project->>'budget')::numeric, 0);
  EXCEPTION WHEN OTHERS THEN
    v_project := '{}'::jsonb;
    v_total_budget := 0;
  END;

  -- 5. Calculate verified paid amount on backend
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(pay.*) ORDER BY pay.payment_date DESC),
      '[]'::jsonb
    ) INTO v_payments
    FROM public.project_payments pay
    WHERE pay.project_id = v_proj_id AND pay.is_verified = true;

    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM public.project_payments
    WHERE project_id = v_proj_id AND is_verified = true;
  EXCEPTION WHEN OTHERS THEN
    v_payments := '[]'::jsonb;
    v_total_paid := 0;
  END;

  -- Strict check on backend
  IF v_total_budget > 0 THEN
    v_is_fully_paid := (v_total_paid >= v_total_budget);
  ELSE
    v_is_fully_paid := (v_total_paid > 0);
  END IF;

  -- 6. Fetch Milestones
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(m.*) ORDER BY m.sort_order ASC, m.created_at ASC),
      '[]'::jsonb
    ) INTO v_milestones
    FROM public.milestones m
    WHERE m.project_id = v_proj_id;
  EXCEPTION WHEN OTHERS THEN
    v_milestones := '[]'::jsonb;
  END;

  -- 7. Fetch Delivery Assets (CRITICAL: asset_url and storage_path are set to NULL if not fully paid)
  BEGIN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ast.id,
          'project_id', ast.project_id,
          'title', ast.title,
          'description', ast.description,
          'asset_type', ast.asset_type,
          'asset_url', CASE WHEN (v_is_fully_paid OR COALESCE(ast.is_manual_unlocked, false)) THEN ast.asset_url ELSE NULL END,
          'storage_path', CASE WHEN (v_is_fully_paid OR COALESCE(ast.is_manual_unlocked, false)) THEN ast.storage_path ELSE NULL END,
          'unlock_type', ast.unlock_type,
          'is_manual_unlocked', COALESCE(ast.is_manual_unlocked, false),
          'is_unlocked', (v_is_fully_paid OR COALESCE(ast.is_manual_unlocked, false)),
          'unlocked', (v_is_fully_paid OR COALESCE(ast.is_manual_unlocked, false)),
          'sort_order', ast.sort_order,
          'created_at', ast.created_at,
          'updated_at', ast.updated_at
        ) ORDER BY ast.created_at DESC
      ),
      '[]'::jsonb
    ) INTO v_assets
    FROM public.delivery_assets ast
    WHERE ast.project_id = v_proj_id AND ast.is_archived = false;
  EXCEPTION WHEN OTHERS THEN
    v_assets := '[]'::jsonb;
  END;

  -- 8. Fetch GitHub
  BEGIN
    SELECT to_jsonb(gh.*) INTO v_github
    FROM public.github_repositories gh
    WHERE gh.project_id = v_proj_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_github := '{}'::jsonb;
  END;

  -- 9. Fetch Docs
  BEGIN
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object(
        'id', d.id,
        'title', d.title,
        'content', d.content,
        'category', COALESCE(d.doc_type, 'General'),
        'doc_type', d.doc_type,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC),
      '[]'::jsonb
    ) INTO v_docs
    FROM public.documents d
    WHERE d.project_id = v_proj_id;
  EXCEPTION WHEN OTHERS THEN
    v_docs := '[]'::jsonb;
  END;

  -- 10. Fetch Timeline
  BEGIN
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object(
        'id', pu.id,
        'title', pu.title,
        'content', pu.description,
        'description', pu.description,
        'created_at', pu.created_at,
        'entry_date', pu.entry_date
      ) ORDER BY pu.created_at DESC),
      '[]'::jsonb
    ) INTO v_timeline
    FROM public.project_updates pu
    WHERE pu.project_id = v_proj_id;
  EXCEPTION WHEN OTHERS THEN
    v_timeline := '[]'::jsonb;
  END;

  -- 11. Fetch Technologies
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(pt.name)),
      '[]'::jsonb
    ) INTO v_techs
    FROM public.project_technologies pt
    WHERE pt.project_id = v_proj_id;

    IF v_techs IS NOT NULL AND jsonb_array_length(v_techs) > 0 THEN
      v_project := jsonb_set(COALESCE(v_project, '{}'::jsonb), '{tech_stack}', v_techs);
    END IF;
  EXCEPTION WHEN OTHERS THEN
  END;

  RETURN jsonb_build_object(
    'link', v_link_json,
    'project', COALESCE(v_project, '{}'::jsonb),
    'milestones', COALESCE(v_milestones, '[]'::jsonb),
    'payments', COALESCE(v_payments, '[]'::jsonb),
    'assets', COALESCE(v_assets, '[]'::jsonb),
    'github', COALESCE(v_github, '{}'::jsonb),
    'docs', COALESCE(v_docs, '[]'::jsonb),
    'timeline', COALESCE(v_timeline, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_portal_data(text, text) TO anon, authenticated;
