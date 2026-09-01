-- Public, read-only social preview resolver. It never records a portal view.
DROP FUNCTION IF EXISTS public.get_share_preview_metadata(text, text);

CREATE OR REPLACE FUNCTION public.get_share_preview_metadata(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_link record;
  v_project record;
  v_client record;
  v_avatar record;
  v_techs text[];
BEGIN
  IF p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN jsonb_build_object('state', 'invalid');
  END IF;

  SELECT id, project_id, is_active, expires_at, password_hash, view_count, max_views, preview_version
    INTO v_link
    FROM public.share_links
   WHERE token = p_token_hash
   LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('state', 'invalid'); END IF;
  IF NOT COALESCE(v_link.is_active, true) THEN RETURN jsonb_build_object('state', 'revoked'); END IF;
  IF v_link.expires_at IS NOT NULL AND v_link.expires_at <= now() THEN RETURN jsonb_build_object('state', 'expired'); END IF;
  IF v_link.max_views IS NOT NULL AND COALESCE(v_link.view_count, 0) >= v_link.max_views THEN RETURN jsonb_build_object('state', 'exhausted'); END IF;
  IF NULLIF(trim(v_link.password_hash), '') IS NOT NULL THEN
    RETURN jsonb_build_object('state', 'protected', 'previewVersion', COALESCE(v_link.preview_version, 1));
  END IF;

  SELECT id, name, status, color, client_id, guardian_avatar_id, avatar_code, avatar_config
    INTO v_project FROM public.projects WHERE id = v_link.project_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('state', 'invalid'); END IF;

  SELECT id, COALESCE(NULLIF(trim(name), ''), NULLIF(trim(company), ''), 'Client') AS display_name
    INTO v_client FROM public.clients WHERE id = v_project.client_id;
  IF v_project.guardian_avatar_id IS NOT NULL THEN
    SELECT id, avatar_code, name, avatar_config, generator_version
      INTO v_avatar FROM public.guardian_avatars WHERE id = v_project.guardian_avatar_id;
  END IF;
  SELECT array_agg(name ORDER BY name) INTO v_techs
    FROM (SELECT name FROM public.project_technologies WHERE project_id = v_project.id LIMIT 3) safe_tech;

  RETURN jsonb_build_object(
    'state', 'available',
    'previewVersion', COALESCE(v_link.preview_version, 1),
    'project', jsonb_build_object(
      'name', substr(COALESCE(v_project.name, 'Shared Project'), 1, 100),
      'safeDescription', 'Secure project workspace shared through Bunker.',
      'status', v_project.status,
      'color', v_project.color,
      'avatarCode', COALESCE(v_avatar.avatar_code, v_project.avatar_code),
      'avatarConfig', COALESCE(v_avatar.avatar_config, v_project.avatar_config)
    ),
    'client', jsonb_build_object('displayName', COALESCE(v_client.display_name, 'Client')),
    'avatar', CASE WHEN v_avatar.id IS NULL THEN NULL ELSE jsonb_build_object(
      'code', v_avatar.avatar_code, 'name', v_avatar.name,
      'config', v_avatar.avatar_config, 'version', v_avatar.generator_version
    ) END,
    'technologies', COALESCE(v_techs, ARRAY[]::text[])
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_share_preview_metadata(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_share_preview_metadata(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.bump_share_preview_version()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_TABLE_NAME = 'guardian_avatars' THEN
    UPDATE public.share_links SET preview_version = preview_version + 1
     WHERE project_id IN (SELECT id FROM public.projects WHERE guardian_avatar_id = NEW.id);
  ELSIF TG_TABLE_NAME = 'projects' THEN
    UPDATE public.share_links SET preview_version = preview_version + 1 WHERE project_id = NEW.id;
  ELSE
    UPDATE public.share_links SET preview_version = preview_version + 1
     WHERE project_id IN (SELECT id FROM public.projects WHERE client_id = NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guardian_share_preview_version ON public.guardian_avatars;
CREATE TRIGGER trg_guardian_share_preview_version AFTER UPDATE OF avatar_config, avatar_code ON public.guardian_avatars
FOR EACH ROW WHEN (OLD.avatar_config IS DISTINCT FROM NEW.avatar_config OR OLD.avatar_code IS DISTINCT FROM NEW.avatar_code)
EXECUTE FUNCTION public.bump_share_preview_version();

DROP TRIGGER IF EXISTS trg_project_share_preview_version ON public.projects;
CREATE TRIGGER trg_project_share_preview_version AFTER UPDATE OF name, status, color, client_id, guardian_avatar_id ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.bump_share_preview_version();

DROP TRIGGER IF EXISTS trg_client_share_preview_version ON public.clients;
CREATE TRIGGER trg_client_share_preview_version AFTER UPDATE OF name, company ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.bump_share_preview_version();
