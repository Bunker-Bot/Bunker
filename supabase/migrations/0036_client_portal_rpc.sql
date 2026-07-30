-- Migration 0036: Enhanced Client Portal RPC
-- Atomic SECURITY DEFINER RPC function that returns all portal resources
-- (project, milestones, payments, delivery assets, github repos, docs, timeline)
-- for a validated share link token. Bypasses RLS for unauthenticated clients.

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
  v_github jsonb;
  v_docs jsonb;
  v_changelogs jsonb;
  v_link_json jsonb;
  v_allowed jsonb;
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

  IF NOT v_link.is_active THEN
    RETURN jsonb_build_object('error', 'ACCESS_REVOKED');
  END IF;

  IF v_link.expires_at IS NOT NULL AND v_link.expires_at < now() THEN
    RETURN jsonb_build_object('error', 'LINK_EXPIRED');
  END IF;

  IF v_link.max_views IS NOT NULL AND v_link.view_count >= v_link.max_views THEN
    RETURN jsonb_build_object('error', 'LIMIT_EXCEEDED');
  END IF;

  -- 2. Increment view count
  UPDATE public.share_links
  SET view_count = COALESCE(view_count, 0) + 1,
      last_access_at = now()
  WHERE id = v_link.id;

  -- 3. Default allowed modules
  v_allowed := COALESCE(
    v_link.permissions,
    '["overview","timeline","documentation","github","finance","deliverables","downloads"]'::jsonb
  );

  -- Build safe link JSON
  v_link_json := jsonb_build_object(
    'id', v_link.id,
    'project_id', v_link.project_id,
    'name', v_link.name,
    'is_active', v_link.is_active,
    'expires_at', v_link.expires_at,
    'max_views', v_link.max_views,
    'view_count', v_link.view_count,
    'password_hash', v_link.password_hash,
    'permissions', v_allowed,
    'allowed_modules', v_allowed,
    'client_name', v_link.client_name,
    'created_at', v_link.created_at
  );

  -- 4. Fetch Project
  SELECT to_jsonb(p.*) INTO v_project
  FROM public.projects p
  WHERE p.id = v_link.project_id;

  -- 5. Fetch Milestones
  SELECT COALESCE(
    jsonb_agg(to_jsonb(m.*) ORDER BY m.sort_order ASC, m.created_at ASC),
    '[]'::jsonb
  ) INTO v_milestones
  FROM public.milestones m
  WHERE m.project_id = v_link.project_id;

  -- 6. Fetch Payments (Verified)
  SELECT COALESCE(
    jsonb_agg(to_jsonb(pay.*) ORDER BY pay.payment_date DESC),
    '[]'::jsonb
  ) INTO v_payments
  FROM public.project_payments pay
  WHERE pay.project_id = v_link.project_id AND pay.is_verified = true;

  -- 7. Fetch Delivery Assets
  SELECT COALESCE(
    jsonb_agg(to_jsonb(ast.*) ORDER BY ast.created_at DESC),
    '[]'::jsonb
  ) INTO v_assets
  FROM public.delivery_assets ast
  WHERE ast.project_id = v_link.project_id AND ast.is_archived = false;

  -- 8. Fetch GitHub Repository
  SELECT to_jsonb(gh.*) INTO v_github
  FROM public.github_repositories gh
  WHERE gh.project_id = v_link.project_id
  LIMIT 1;

  -- 9. Fetch Published Docs (if documentation table exists)
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(d.*) ORDER BY d.created_at DESC),
      '[]'::jsonb
    ) INTO v_docs
    FROM public.documentation d
    WHERE d.project_id = v_link.project_id;
  EXCEPTION WHEN OTHERS THEN
    v_docs := '[]'::jsonb;
  END;

  -- 10. Fetch Timeline / Changelogs
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(c.*) ORDER BY c.created_at DESC),
      '[]'::jsonb
    ) INTO v_changelogs
    FROM public.changelog_notes c
    WHERE c.project_id = v_link.project_id;
  EXCEPTION WHEN OTHERS THEN
    v_changelogs := '[]'::jsonb;
  END;

  -- Return payload
  RETURN jsonb_build_object(
    'link', v_link_json,
    'project', COALESCE(v_project, '{}'::jsonb),
    'milestones', v_milestones,
    'payments', v_payments,
    'assets', v_assets,
    'github', COALESCE(v_github, '{}'::jsonb),
    'docs', v_docs,
    'timeline', v_changelogs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_portal_data(text, text) TO anon, authenticated;
