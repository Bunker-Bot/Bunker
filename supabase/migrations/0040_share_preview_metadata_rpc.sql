-- Migration 0040: Safe Share Preview Metadata RPC & Avatar Config Columns
-- This RPC is specifically purpose-built for social crawlers, OG previews, and share-entry metadata.
-- CRITICAL SECURITY GUARANTEES:
-- 1. NEVER increments view_count on share_links.
-- 2. NEVER logs share_link_events or telemetry.
-- 3. NEVER returns password_hash, payments, documents, credentials, or internal notes.
-- 4. Automatically masks password-protected, expired, and revoked links into safe minimal DTOs.

-- 1. Add optional custom avatar configs and preview versioning if not exists
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS avatar_config jsonb DEFAULT NULL;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS avatar_config jsonb DEFAULT NULL;

ALTER TABLE public.share_links
ADD COLUMN IF NOT EXISTS preview_version integer NOT NULL DEFAULT 1;

-- 2. Create the Safe Preview Metadata RPC
CREATE OR REPLACE FUNCTION public.get_share_preview_metadata(
  p_token_hash text,
  p_raw_token text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_link record;
  v_link_jsonb jsonb;
  v_project record;
  v_client record;
  v_client_name text;
  v_client_logo text;
  v_techs jsonb;
  v_is_active boolean;
  v_expires_at timestamptz;
  v_max_views integer;
  v_view_count integer;
  v_has_password boolean;
BEGIN
  -- 1. Locate share link record without incrementing view_count
  SELECT * INTO v_link
  FROM public.share_links
  WHERE token = p_token_hash
     OR (p_raw_token IS NOT NULL AND token = p_raw_token)
  LIMIT 1;

  IF v_link IS NULL THEN
    RETURN jsonb_build_object('state', 'invalid');
  END IF;

  v_link_jsonb := to_jsonb(v_link);
  v_is_active := COALESCE((v_link_jsonb->>'is_active')::boolean, true);
  v_expires_at := (v_link_jsonb->>'expires_at')::timestamptz;
  v_max_views := (v_link_jsonb->>'max_views')::integer;
  v_view_count := COALESCE((v_link_jsonb->>'view_count')::integer, 0);
  v_has_password := v_link_jsonb->>'password_hash' IS NOT NULL AND length(trim(v_link_jsonb->>'password_hash')) > 0;

  -- 2. Revocation Check
  IF NOT v_is_active THEN
    RETURN jsonb_build_object(
      'state', 'revoked',
      'shareLinkId', v_link_jsonb->>'id'
    );
  END IF;

  -- 3. Expiration Check
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    RETURN jsonb_build_object(
      'state', 'expired',
      'shareLinkId', v_link_jsonb->>'id'
    );
  END IF;

  -- 4. View Limit Exhaustion Check
  IF v_max_views IS NOT NULL AND v_view_count >= v_max_views THEN
    RETURN jsonb_build_object(
      'state', 'exhausted',
      'shareLinkId', v_link_jsonb->>'id'
    );
  END IF;

  -- 5. Password-Protected Link (Return safe protected preview without leaking details)
  IF v_has_password THEN
    RETURN jsonb_build_object(
      'state', 'protected',
      'shareLinkId', v_link_jsonb->>'id',
      'project', jsonb_build_object(
        'name', 'Protected Project Vault',
        'status', 'Protected Access'
      ),
      'client', jsonb_build_object(
        'displayName', 'Client Access'
      )
    );
  END IF;

  -- 6. Fetch Project Details
  SELECT * INTO v_project
  FROM public.projects
  WHERE id = (v_link_jsonb->>'project_id')::uuid;

  IF v_project IS NULL THEN
    RETURN jsonb_build_object('state', 'invalid');
  END IF;

  -- 7. Fetch Client Details if available
  v_client_name := COALESCE(NULLIF(trim(v_link_jsonb->>'client_name'), ''), 'Valued Client');
  v_client_logo := NULL;

  IF v_project.client_id IS NOT NULL THEN
    SELECT * INTO v_client
    FROM public.clients
    WHERE id = v_project.client_id;

    IF v_client IS NOT NULL THEN
      IF v_client_name = 'Valued Client' THEN
        v_client_name := COALESCE(NULLIF(trim(v_client.name), ''), NULLIF(trim(v_client.company), ''), 'Valued Client');
      END IF;
      -- Client logo if column exists
      BEGIN
        v_client_logo := to_jsonb(v_client)->>'logo_url';
      EXCEPTION WHEN OTHERS THEN
        v_client_logo := NULL;
      END;
    END IF;
  END IF;

  -- 8. Fetch Project Technologies (Safe names only)
  BEGIN
    SELECT COALESCE(
      jsonb_agg(pt.name ORDER BY pt.sort_order ASC, pt.created_at ASC),
      '[]'::jsonb
    ) INTO v_techs
    FROM (
      SELECT name, sort_order, created_at
      FROM public.project_technologies
      WHERE project_id = v_project.id
      LIMIT 4
    ) pt;
  EXCEPTION WHEN OTHERS THEN
    v_techs := '[]'::jsonb;
  END;

  -- 9. Return Sanitized Allowlisted Preview DTO
  RETURN jsonb_build_object(
    'state', 'available',
    'shareLinkId', v_link_jsonb->>'id',
    'previewVersion', COALESCE((v_link_jsonb->>'preview_version')::integer, 1),
    'project', jsonb_build_object(
      'id', v_project.id,
      'name', v_project.name,
      'description', substr(COALESCE(v_project.description, ''), 1, 160),
      'status', COALESCE(v_project.status::text, 'Active'),
      'completionPercent', COALESCE(v_project.completion_percent, 0),
      'color', COALESCE(v_project.color, '#06B6D4'),
      'thumbnailUrl', v_project.thumbnail_url
    ),
    'client', jsonb_build_object(
      'id', v_project.client_id,
      'displayName', v_client_name,
      'logoUrl', v_client_logo
    ),
    'technologies', v_techs,
    'avatar', jsonb_build_object(
      'seed', concat('v1::project::', COALESCE(v_project.client_id::text, ''), '::', v_project.id::text, '::', v_project.name),
      'version', 1,
      'config', v_project.avatar_config
    )
  );
END;
$$;

-- Explicitly grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_share_preview_metadata(text, text) TO anon, authenticated, service_role;
