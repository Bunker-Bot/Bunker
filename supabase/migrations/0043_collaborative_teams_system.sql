-- ==============================================================================
-- Migration: 0043_collaborative_teams_system.sql
-- Description: Collaborative Team Workspaces, Team Memberships, Project/Client
--              Assignments, Time Tracking, Team Guardian Identity & Aggregations
-- ==============================================================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  team_type text NOT NULL DEFAULT 'Engineering',
  default_currency text NOT NULL DEFAULT 'INR',
  timezone text NOT NULL DEFAULT 'UTC',
  primary_color text DEFAULT '#06B6D4',
  secondary_color text DEFAULT '#8B5CF6',
  accent_color text DEFAULT '#10B981',
  guardian_avatar_id uuid,
  avatar_code varchar(10),
  avatar_config jsonb,
  avatar_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teams_avatar_code_format CHECK (avatar_code IS NULL OR avatar_code ~ '^[0-9]{10}$')
);

-- 2. Extend Guardian Avatars Table to Support Teams
ALTER TABLE public.guardian_avatars
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_type text NOT NULL DEFAULT 'project' CHECK (entity_type IN ('project', 'team', 'client', 'generic'));

-- Add Foreign Key from teams to guardian_avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_guardian_avatar_id_fkey'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_guardian_avatar_id_fkey
      FOREIGN KEY (guardian_avatar_id) REFERENCES public.guardian_avatars(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create Team Memberships Table
CREATE TABLE IF NOT EXISTS public.team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('owner', 'admin', 'project_manager', 'contributor', 'viewer', 'finance_manager')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- 4. Create Team Clients Table (Client Scope)
CREATE TABLE IF NOT EXISTS public.team_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'primary',
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, client_id)
);

-- 5. Extend Projects Table with team_id
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- 6. Create Project Memberships Table
CREATE TABLE IF NOT EXISTS public.project_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_role text NOT NULL DEFAULT 'contributor' CHECK (project_role IN ('lead', 'developer', 'designer', 'contributor', 'reviewer', 'viewer')),
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- 7. Create Team Invitations Table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'project_manager', 'contributor', 'viewer', 'finance_manager')),
  token text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Create Time Entries Table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  note text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  billable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams (slug);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams (status);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams (created_by);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON public.team_memberships (team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id ON public.team_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_status ON public.team_memberships (status);
CREATE INDEX IF NOT EXISTS idx_team_clients_team_id ON public.team_clients (team_id);
CREATE INDEX IF NOT EXISTS idx_team_clients_client_id ON public.team_clients (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects (team_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON public.project_memberships (project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_team_id ON public.project_memberships (team_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_user_id ON public.project_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_team_id ON public.time_entries (team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries (project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_started_at ON public.time_entries (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_avatars_team_id ON public.guardian_avatars (team_id);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- 11. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE team_id = p_team_id
      AND user_id = p_user_id
      AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = p_team_id AND created_by = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_team_role(p_team_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.team_memberships WHERE team_id = p_team_id AND user_id = p_user_id AND status = 'active'),
    CASE WHEN EXISTS (SELECT 1 FROM public.teams WHERE id = p_team_id AND created_by = p_user_id) THEN 'owner' ELSE NULL END
  );
$$;

-- 12. RLS Policies for Teams
CREATE POLICY "Users can view teams they are members or creators of"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR public.is_team_member(id, (SELECT auth.uid()))
  );

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Team owners and admins can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR public.get_team_role(id, (SELECT auth.uid())) IN ('owner', 'admin')
  )
  WITH CHECK (
    created_by = (SELECT auth.uid())
    OR public.get_team_role(id, (SELECT auth.uid())) IN ('owner', 'admin')
  );

CREATE POLICY "Only team creator or owner can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (created_by = (SELECT auth.uid()) OR public.get_team_role(id, (SELECT auth.uid())) = 'owner');

-- 13. RLS Policies for Team Memberships
CREATE POLICY "Team members can view team memberships"
  ON public.team_memberships FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_team_member(team_id, (SELECT auth.uid()))
  );

CREATE POLICY "Team owners and admins can manage memberships"
  ON public.team_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin')
    OR user_id = (SELECT auth.uid())
  );

CREATE POLICY "Team owners and admins can update memberships"
  ON public.team_memberships FOR UPDATE
  TO authenticated
  USING (public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin'))
  WITH CHECK (public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin'));

CREATE POLICY "Team owners and admins can delete memberships"
  ON public.team_memberships FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin')
  );

-- 14. RLS Policies for Team Clients
CREATE POLICY "Team members can view team clients"
  ON public.team_clients FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id, (SELECT auth.uid())));

CREATE POLICY "Team managers can manage team clients"
  ON public.team_clients FOR ALL
  TO authenticated
  USING (public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin', 'project_manager'))
  WITH CHECK (public.get_team_role(team_id, (SELECT auth.uid())) IN ('owner', 'admin', 'project_manager'));

-- 15. RLS Policies for Time Entries
CREATE POLICY "Users can view time entries of their teams"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, (SELECT auth.uid())))
  );

CREATE POLICY "Users can insert their own time entries"
  ON public.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own time entries"
  ON public.time_entries FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 16. Trigger: Automatically Add Owner Membership on Team Creation
CREATE OR REPLACE FUNCTION public.on_team_created_add_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.team_memberships (team_id, user_id, role, status, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', 'active', now())
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_team_created_add_owner ON public.teams;
CREATE TRIGGER trg_on_team_created_add_owner
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.on_team_created_add_owner();

-- 17. Trigger: Synchronize Team Guardian with teams table
CREATE OR REPLACE FUNCTION public.sync_guardian_avatar_team()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.team_id IS NOT NULL THEN
      UPDATE public.teams
      SET guardian_avatar_id = NEW.id,
          avatar_code = NEW.avatar_code,
          avatar_config = NEW.avatar_config,
          avatar_version = NEW.generator_version,
          updated_at = now()
      WHERE id = NEW.team_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_guardian_avatar_team ON public.guardian_avatars;
CREATE TRIGGER trg_sync_guardian_avatar_team
  AFTER INSERT OR UPDATE OF avatar_config, avatar_code, team_id ON public.guardian_avatars
  FOR EACH ROW
  WHEN (NEW.team_id IS NOT NULL)
  EXECUTE FUNCTION public.sync_guardian_avatar_team();

-- 18. RPC: get_team_overview
CREATE OR REPLACE FUNCTION public.get_team_overview(p_team_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
  v_user_role text;
  v_team record;
  v_members_count integer := 0;
  v_clients_count integer := 0;
  v_projects_count integer := 0;
  v_active_projects_count integer := 0;
  v_pending_deliverables_count integer := 0;
  v_week_minutes integer := 0;
  v_finance jsonb := '[]'::jsonb;
  v_recent_projects jsonb := '[]'::jsonb;
BEGIN
  v_user_id := auth.uid();

  -- Verify existence and membership
  SELECT * INTO v_team FROM public.teams WHERE id = p_team_id;
  IF v_team.id IS NULL THEN
    RETURN jsonb_build_object('error', 'TEAM_NOT_FOUND');
  END IF;

  v_is_member := public.is_team_member(p_team_id, v_user_id);
  IF NOT v_is_member THEN
    RETURN jsonb_build_object('error', 'UNAUTHORIZED');
  END IF;

  v_user_role := public.get_team_role(p_team_id, v_user_id);

  -- Count metrics
  SELECT count(*) INTO v_members_count FROM public.team_memberships WHERE team_id = p_team_id AND status = 'active';
  SELECT count(*) INTO v_clients_count FROM public.team_clients WHERE team_id = p_team_id;
  SELECT count(*) INTO v_projects_count FROM public.projects WHERE team_id = p_team_id;
  SELECT count(*) INTO v_active_projects_count FROM public.projects WHERE team_id = p_team_id AND status IN ('planning', 'active', 'in_progress', 'review');

  -- Count pending deliverables
  SELECT count(*) INTO v_pending_deliverables_count
  FROM public.delivery_assets da
  JOIN public.projects p ON p.id = da.project_id
  WHERE p.team_id = p_team_id AND da.is_manual_unlocked = false AND da.is_archived = false;

  -- Sum tracked minutes this week
  SELECT COALESCE(SUM(duration_minutes), 0) INTO v_week_minutes
  FROM public.time_entries
  WHERE team_id = p_team_id
    AND started_at >= date_trunc('week', now());

  -- Financial totals if authorized (owner, admin, project_manager, finance_manager)
  IF v_user_role IN ('owner', 'admin', 'project_manager', 'finance_manager') THEN
    SELECT COALESCE(jsonb_agg(f), '[]'::jsonb) INTO v_finance
    FROM (
      SELECT
        p.currency,
        COALESCE(SUM(p.budget), 0) AS total_value,
        COALESCE(SUM(paid.amount), 0) AS received,
        GREATEST(0, COALESCE(SUM(p.budget), 0) - COALESCE(SUM(paid.amount), 0)) AS remaining
      FROM public.projects p
      LEFT JOIN (
        SELECT project_id, SUM(amount) as amount
        FROM public.project_payments
        WHERE is_verified = true
        GROUP BY project_id
      ) paid ON paid.project_id = p.id
      WHERE p.team_id = p_team_id
      GROUP BY p.currency
    ) f;
  END IF;

  -- Recent 5 projects
  SELECT COALESCE(jsonb_agg(rp), '[]'::jsonb) INTO v_recent_projects
  FROM (
    SELECT id, name, slug, status, completion_percent, color, avatar_code, budget, currency, created_at
    FROM public.projects
    WHERE team_id = p_team_id
    ORDER BY updated_at DESC
    LIMIT 5
  ) rp;

  RETURN jsonb_build_object(
    'team', jsonb_build_object(
      'id', v_team.id,
      'name', v_team.name,
      'slug', v_team.slug,
      'description', v_team.description,
      'team_type', v_team.team_type,
      'default_currency', v_team.default_currency,
      'timezone', v_team.timezone,
      'primary_color', v_team.primary_color,
      'secondary_color', v_team.secondary_color,
      'accent_color', v_team.accent_color,
      'guardian_avatar_id', v_team.guardian_avatar_id,
      'avatar_code', v_team.avatar_code,
      'avatar_config', v_team.avatar_config,
      'avatar_version', v_team.avatar_version,
      'status', v_team.status,
      'created_at', v_team.created_at,
      'updated_at', v_team.updated_at
    ),
    'user_role', v_user_role,
    'counts', jsonb_build_object(
      'members', v_members_count,
      'clients', v_clients_count,
      'projects', v_projects_count,
      'active_projects', v_active_projects_count,
      'pending_deliverables', v_pending_deliverables_count
    ),
    'time_summary', jsonb_build_object(
      'week_minutes', v_week_minutes
    ),
    'finance', v_finance,
    'recent_projects', v_recent_projects
  );
END;
$$;

-- 19. RPC: get_team_financial_summary
CREATE OR REPLACE FUNCTION public.get_team_financial_summary(p_team_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
  v_user_role text;
  v_summary jsonb := '[]'::jsonb;
  v_projects jsonb := '[]'::jsonb;
BEGIN
  v_user_id := auth.uid();
  v_is_member := public.is_team_member(p_team_id, v_user_id);
  IF NOT v_is_member THEN
    RETURN jsonb_build_object('error', 'UNAUTHORIZED');
  END IF;

  v_user_role := public.get_team_role(p_team_id, v_user_id);
  IF v_user_role NOT IN ('owner', 'admin', 'project_manager', 'finance_manager') THEN
    RETURN jsonb_build_object('error', 'FORBIDDEN_FINANCE_ACCESS');
  END IF;

  -- Currency group breakdown
  SELECT COALESCE(jsonb_agg(f), '[]'::jsonb) INTO v_summary
  FROM (
    SELECT
      p.currency,
      COALESCE(SUM(p.budget), 0) AS total_value,
      COALESCE(SUM(paid.amount), 0) AS received,
      GREATEST(0, COALESCE(SUM(p.budget), 0) - COALESCE(SUM(paid.amount), 0)) AS remaining
    FROM public.projects p
    LEFT JOIN (
      SELECT project_id, SUM(amount) as amount
      FROM public.project_payments
      WHERE is_verified = true
      GROUP BY project_id
    ) paid ON paid.project_id = p.id
    WHERE p.team_id = p_team_id
    GROUP BY p.currency
  ) f;

  -- Project-level financial breakdown
  SELECT COALESCE(jsonb_agg(pf), '[]'::jsonb) INTO v_projects
  FROM (
    SELECT
      p.id,
      p.name,
      p.slug,
      p.status,
      p.currency,
      COALESCE(p.budget, 0) AS budget,
      COALESCE(paid.amount, 0) AS received,
      GREATEST(0, COALESCE(p.budget, 0) - COALESCE(paid.amount, 0)) AS remaining
    FROM public.projects p
    LEFT JOIN (
      SELECT project_id, SUM(amount) as amount
      FROM public.project_payments
      WHERE is_verified = true
      GROUP BY project_id
    ) paid ON paid.project_id = p.id
    WHERE p.team_id = p_team_id
    ORDER BY p.updated_at DESC
  ) pf;

  RETURN jsonb_build_object(
    'currencies', v_summary,
    'projects', v_projects
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_role(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_overview(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_financial_summary(uuid) TO authenticated;
