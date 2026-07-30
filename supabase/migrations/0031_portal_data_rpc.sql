-- Migration 0031: Secure Portal Data RPC
-- Single SECURITY DEFINER function that fetches all portal data
-- for a validated share link token, bypassing table-level RLS entirely.
-- This is the ONLY way unauthenticated clients can read project data.

CREATE OR REPLACE FUNCTION public.get_portal_data(p_token_hash text, p_raw_token text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link record;
  v_project jsonb;
  v_milestones jsonb;
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

  -- 3. Build link JSON with only guaranteed columns
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

  -- 4. Fetch project data (bypasses RLS because SECURITY DEFINER)
  SELECT to_jsonb(p.*) INTO v_project
  FROM public.projects p
  WHERE p.id = v_link.project_id;

  -- 5. Fetch milestones (bypasses RLS because SECURITY DEFINER)
  SELECT COALESCE(
    jsonb_agg(to_jsonb(m.*) ORDER BY m.sort_order ASC, m.created_at ASC),
    '[]'::jsonb
  ) INTO v_milestones
  FROM public.milestones m
  WHERE m.project_id = v_link.project_id;

  -- 6. Return everything
  RETURN jsonb_build_object(
    'link', v_link_json,
    'project', COALESCE(v_project, '{}'::jsonb),
    'milestones', v_milestones
  );
END;
$$;

-- Grant to anon so unauthenticated share link visitors can call it
GRANT EXECUTE ON FUNCTION public.get_portal_data(text, text) TO anon, authenticated;
