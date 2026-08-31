-- ==============================================================================
-- Migration: 0041_guardian_avatars_studio.sql
-- Description: Guardian Avatars Studio, 10-digit Avatar Codes & Project Assignment
-- ==============================================================================

-- 1. Create 10-digit Avatar Code Generator Function
CREATE OR REPLACE FUNCTION public.generate_guardian_avatar_code()
RETURNS varchar(10)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code varchar(10);
  v_exists boolean;
  v_attempts integer := 0;
  v_max_attempts constant integer := 50;
BEGIN
  LOOP
    v_attempts := v_attempts + 1;
    IF v_attempts > v_max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique 10-digit avatar code after % attempts', v_max_attempts;
    END IF;

    -- Generate random 10-digit integer padded with leading zeros (0000000000 - 9999999999)
    v_code := lpad(floor(random() * 10000000000)::text, 10, '0');

    -- Ensure exact 10 digits
    IF length(v_code) = 10 THEN
      -- Check collision in guardian_avatars
      SELECT EXISTS (
        SELECT 1 FROM public.guardian_avatars WHERE avatar_code = v_code
      ) INTO v_exists;

      IF NOT v_exists THEN
        RETURN v_code;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- 2. Create Guardian Avatars Table
CREATE TABLE IF NOT EXISTS public.guardian_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_code varchar(10) NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Bunker Guardian',
  avatar_config jsonb NOT NULL,
  generator_version integer NOT NULL DEFAULT 1,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guardian_avatar_code_format CHECK (avatar_code ~ '^[0-9]{10}$')
);

-- 3. Extend Projects Table with Guardian Avatar Relations
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS guardian_avatar_id uuid REFERENCES public.guardian_avatars(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_code varchar(10),
  ADD COLUMN IF NOT EXISTS avatar_config jsonb,
  ADD COLUMN IF NOT EXISTS avatar_version integer NOT NULL DEFAULT 1;

-- Add Constraint & Indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_avatar_code_format'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_avatar_code_format
      CHECK (avatar_code IS NULL OR avatar_code ~ '^[0-9]{10}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_guardian_avatars_code ON public.guardian_avatars (avatar_code);
CREATE INDEX IF NOT EXISTS idx_guardian_avatars_project_id ON public.guardian_avatars (project_id);
CREATE INDEX IF NOT EXISTS idx_projects_guardian_avatar_id ON public.projects (guardian_avatar_id);
CREATE INDEX IF NOT EXISTS idx_projects_avatar_code ON public.projects (avatar_code);

-- Unique index to guarantee 1:1 relationship between assigned project and active avatar
CREATE UNIQUE INDEX IF NOT EXISTS uq_guardian_avatars_project_id
  ON public.guardian_avatars (project_id)
  WHERE project_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_projects_guardian_avatar_id
  ON public.projects (guardian_avatar_id)
  WHERE guardian_avatar_id IS NOT NULL;

-- 4. Automatic Database Synchronization Trigger
CREATE OR REPLACE FUNCTION public.sync_guardian_avatar_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent infinite recursive trigger loops between guardian_avatars and projects
  IF pg_trigger_depth() > 1 THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  -- When guardian_avatars is updated or inserted
  IF TG_TABLE_NAME = 'guardian_avatars' THEN
    -- If project_id is being set
    IF NEW.project_id IS NOT NULL THEN
      -- Update project's avatar reference only if different
      UPDATE public.projects
      SET guardian_avatar_id = NEW.id,
          avatar_code = NEW.avatar_code,
          avatar_version = NEW.generator_version,
          updated_at = now()
      WHERE id = NEW.project_id
        AND (guardian_avatar_id IS DISTINCT FROM NEW.id OR avatar_code IS DISTINCT FROM NEW.avatar_code);
    END IF;

    -- If project_id was cleared
    IF OLD IS NOT NULL AND OLD.project_id IS NOT NULL AND (NEW.project_id IS NULL OR NEW.project_id <> OLD.project_id) THEN
      UPDATE public.projects
      SET guardian_avatar_id = NULL,
          avatar_code = NULL,
          updated_at = now()
      WHERE id = OLD.project_id AND guardian_avatar_id = OLD.id;
    END IF;

    RETURN NEW;
  END IF;

  -- When projects is updated
  IF TG_TABLE_NAME = 'projects' THEN
    -- If guardian_avatar_id changed
    IF NEW.guardian_avatar_id IS DISTINCT FROM OLD.guardian_avatar_id THEN
      IF NEW.guardian_avatar_id IS NOT NULL THEN
        -- Link avatar to this project and sync code
        UPDATE public.guardian_avatars
        SET project_id = NEW.id,
            updated_at = now()
        WHERE id = NEW.guardian_avatar_id
          AND project_id IS DISTINCT FROM NEW.id;

        SELECT avatar_code, generator_version
        INTO NEW.avatar_code, NEW.avatar_version
        FROM public.guardian_avatars
        WHERE id = NEW.guardian_avatar_id;
      ELSE
        NEW.avatar_code := NULL;
        IF OLD.guardian_avatar_id IS NOT NULL THEN
          UPDATE public.guardian_avatars
          SET project_id = NULL,
              updated_at = now()
          WHERE id = OLD.guardian_avatar_id
            AND project_id = OLD.id;
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_guardian_avatar ON public.guardian_avatars;
CREATE TRIGGER trg_sync_guardian_avatar
  AFTER INSERT OR UPDATE OF project_id, avatar_code ON public.guardian_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_guardian_avatar_project();

DROP TRIGGER IF EXISTS trg_sync_project_avatar ON public.projects;
CREATE TRIGGER trg_sync_project_avatar
  BEFORE UPDATE OF guardian_avatar_id ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_guardian_avatar_project();

-- 5. Updated At Trigger
CREATE OR REPLACE FUNCTION public.handle_guardian_avatar_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guardian_avatar_updated_at ON public.guardian_avatars;
CREATE TRIGGER trg_guardian_avatar_updated_at
  BEFORE UPDATE ON public.guardian_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_guardian_avatar_updated_at();

-- 6. Row Level Security Policies
ALTER TABLE public.guardian_avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select guardian avatars" ON public.guardian_avatars;
CREATE POLICY "Authenticated users can select guardian avatars"
  ON public.guardian_avatars
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert guardian avatars" ON public.guardian_avatars;
CREATE POLICY "Authenticated users can insert guardian avatars"
  ON public.guardian_avatars
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update guardian avatars" ON public.guardian_avatars;
CREATE POLICY "Authenticated users can update guardian avatars"
  ON public.guardian_avatars
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete guardian avatars" ON public.guardian_avatars;
CREATE POLICY "Authenticated users can delete guardian avatars"
  ON public.guardian_avatars
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. Update get_share_preview_metadata RPC to Resolve Assigned Guardian Identity
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
  v_project record;
  v_client record;
  v_avatar record;
  v_techs text[];
  v_effective_hash text;
BEGIN
  -- Determine effective token hash
  IF p_token_hash IS NOT NULL AND length(p_token_hash) = 64 THEN
    v_effective_hash := p_token_hash;
  ELSIF p_raw_token IS NOT NULL THEN
    v_effective_hash := encode(digest(p_raw_token, 'sha256'), 'hex');
  ELSE
    RETURN jsonb_build_object(
      'state', 'invalid',
      'message', 'No valid token provided'
    );
  END IF;

  -- 1. Fetch share link record
  SELECT sl.id, sl.project_id, sl.name, sl.is_active, sl.expires_at, sl.password_hash,
         sl.view_count, sl.max_views, sl.preview_version
  INTO v_link
  FROM public.share_links sl
  WHERE sl.token = v_effective_hash;

  -- If not found, check fallback with raw token
  IF NOT FOUND AND p_raw_token IS NOT NULL THEN
    SELECT sl.id, sl.project_id, sl.name, sl.is_active, sl.expires_at, sl.password_hash,
           sl.view_count, sl.max_views, sl.preview_version
    INTO v_link
    FROM public.share_links sl
    WHERE sl.token = p_raw_token;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'state', 'invalid',
      'message', 'Share link not found'
    );
  END IF;

  -- 2. Check revocation
  IF v_link.is_active = false THEN
    RETURN jsonb_build_object(
      'state', 'revoked',
      'message', 'This share link has been deactivated',
      'shareLinkId', v_link.id
    );
  END IF;

  -- 3. Check expiration
  IF v_link.expires_at IS NOT NULL AND v_link.expires_at < now() THEN
    RETURN jsonb_build_object(
      'state', 'expired',
      'message', 'This share link has expired',
      'shareLinkId', v_link.id
    );
  END IF;

  -- 4. Check view limit
  IF v_link.max_views IS NOT NULL AND v_link.view_count >= v_link.max_views THEN
    RETURN jsonb_build_object(
      'state', 'view_limit_reached',
      'message', 'This share link has reached its maximum view limit',
      'shareLinkId', v_link.id
    );
  END IF;

  -- 5. Password-protected state
  IF v_link.password_hash IS NOT NULL AND length(v_link.password_hash) > 0 THEN
    RETURN jsonb_build_object(
      'state', 'protected',
      'shareLinkId', v_link.id,
      'previewVersion', COALESCE(v_link.preview_version, 1),
      'message', 'Cryptographically protected project vault'
    );
  END IF;

  -- 6. Fetch project details & assigned Guardian avatar
  SELECT p.id, p.name, p.slug, p.description, p.status, p.completion_percent,
         p.color, p.client_id, p.avatar_code, p.avatar_config, p.guardian_avatar_id
  INTO v_project
  FROM public.projects p
  WHERE p.id = v_link.project_id;

  -- If project has assigned guardian avatar, fetch its metadata
  IF v_project.guardian_avatar_id IS NOT NULL THEN
    SELECT ga.id, ga.avatar_code, ga.name, ga.avatar_config, ga.generator_version
    INTO v_avatar
    FROM public.guardian_avatars ga
    WHERE ga.id = v_project.guardian_avatar_id;
  END IF;

  -- Fetch client name safely
  SELECT c.id, COALESCE(c.name, c.company, 'Client') AS display_name
  INTO v_client
  FROM public.clients c
  WHERE c.id = v_project.client_id;

  -- Fetch tech stack
  SELECT array_agg(pt.technology ORDER BY pt.technology)
  INTO v_techs
  FROM public.project_technologies pt
  WHERE pt.project_id = v_project.id;

  -- Assemble Safe Preview Payload
  RETURN jsonb_build_object(
    'state', 'available',
    'shareLinkId', v_link.id,
    'previewVersion', COALESCE(v_link.preview_version, 1),
    'project', jsonb_build_object(
      'id', v_project.id,
      'name', v_project.name,
      'slug', v_project.slug,
      'description', v_project.description,
      'status', v_project.status,
      'completionPercent', COALESCE(v_project.completion_percent, 0),
      'color', v_project.color,
      'avatarCode', COALESCE(v_avatar.avatar_code, v_project.avatar_code),
      'avatarConfig', COALESCE(v_avatar.avatar_config, v_project.avatar_config)
    ),
    'client', jsonb_build_object(
      'id', v_client.id,
      'displayName', COALESCE(v_client.display_name, 'Client Deliverables')
    ),
    'avatar', CASE
      WHEN v_avatar.id IS NOT NULL THEN jsonb_build_object(
        'id', v_avatar.id,
        'code', v_avatar.avatar_code,
        'name', v_avatar.name,
        'config', v_avatar.avatar_config,
        'version', v_avatar.generator_version
      )
      ELSE NULL
    END,
    'technologies', COALESCE(v_techs, ARRAY[]::text[])
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_guardian_avatar_code() TO authenticated, service_role;
