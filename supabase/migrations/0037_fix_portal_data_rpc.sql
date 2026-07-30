-- Migration 0037: Ultra-Resilient Client Portal RPC
-- Queries documents, project_updates, project_technologies, milestones,
-- delivery_assets, project_payments, and github_repositories.
-- Uses to_jsonb(v_link) for safe column access to prevent 400 Bad Request errors
-- on database schemas with missing optional columns.

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

  -- 2. Safely increment view count
  BEGIN
    UPDATE public.share_links
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = v_link.id;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore update errors on restricted environments
  END;

  -- 3. Extract allowed modules safely
  v_allowed := COALESCE(
    v_link_jsonb->'permissions',
    v_link_jsonb->'allowed_modules',
    '["overview","timeline","documentation","github","finance","deliverables","downloads"]'::jsonb
  );

  -- Build safe link JSON
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

  -- 4. Fetch Project
  BEGIN
    SELECT to_jsonb(p.*) INTO v_project
    FROM public.projects p
    WHERE p.id = v_proj_id;
  EXCEPTION WHEN OTHERS THEN
    v_project := '{}'::jsonb;
  END;

  -- 5. Fetch Milestones
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

  -- 6. Fetch Payments (Verified)
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(pay.*) ORDER BY pay.payment_date DESC),
      '[]'::jsonb
    ) INTO v_payments
    FROM public.project_payments pay
    WHERE pay.project_id = v_proj_id AND pay.is_verified = true;
  EXCEPTION WHEN OTHERS THEN
    v_payments := '[]'::jsonb;
  END;

  -- 7. Fetch Delivery Assets
  BEGIN
    SELECT COALESCE(
      jsonb_agg(to_jsonb(ast.*) ORDER BY ast.created_at DESC),
      '[]'::jsonb
    ) INTO v_assets
    FROM public.delivery_assets ast
    WHERE ast.project_id = v_proj_id AND ast.is_archived = false;
  EXCEPTION WHEN OTHERS THEN
    v_assets := '[]'::jsonb;
  END;

  -- 8. Fetch GitHub Repository
  BEGIN
    SELECT to_jsonb(gh.*) INTO v_github
    FROM public.github_repositories gh
    WHERE gh.project_id = v_proj_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_github := '{}'::jsonb;
  END;

  -- 9. Fetch Documents from public.documents
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

  -- 10. Fetch Timeline Updates from public.project_updates
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

  -- 11. Fetch Technologies from public.project_technologies
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
    -- Ignore if table does not exist
  END;

  -- Return final consolidated portal payload
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
