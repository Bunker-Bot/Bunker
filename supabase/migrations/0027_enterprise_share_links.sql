-- Migration 0027: Enterprise Share Link Columns & RPCs
ALTER TABLE public.share_links
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS label text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS purpose text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS token_preview text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_access_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_ip text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_country text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_device text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_browser text DEFAULT NULL;

-- Atomic RPC function to create a share link and deactivate previous active share links if policy enforces single active link
CREATE OR REPLACE FUNCTION public.create_share_link_transaction(
  p_project_id uuid,
  p_name text,
  p_token text,
  p_password_hash text,
  p_expires_at timestamptz,
  p_max_views integer,
  p_permissions jsonb,
  p_notes text,
  p_client_name text,
  p_label text,
  p_purpose text,
  p_token_preview text,
  p_created_by uuid,
  p_allow_multiple boolean DEFAULT false
)
RETURNS public.share_links
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_link public.share_links;
BEGIN
  -- 1. Deactivate existing active links for project if single active link policy is active
  IF NOT p_allow_multiple THEN
    UPDATE public.share_links
    SET is_active = false
    WHERE project_id = p_project_id AND is_active = true;
  END IF;

  -- 2. Insert new share link
  INSERT INTO public.share_links (
    project_id,
    name,
    token,
    password_hash,
    expires_at,
    is_active,
    max_views,
    permissions,
    notes,
    client_name,
    label,
    purpose,
    token_preview,
    created_by,
    created_at
  ) VALUES (
    p_project_id,
    COALESCE(p_name, 'Client Review'),
    p_token,
    p_password_hash,
    p_expires_at,
    true,
    p_max_views,
    COALESCE(p_permissions, '{"overview": true, "timeline": true, "milestones": true}'::jsonb),
    p_notes,
    p_client_name,
    p_label,
    p_purpose,
    p_token_preview,
    p_created_by,
    now()
  )
  RETURNING * INTO v_new_link;

  RETURN v_new_link;
END;
$$;
