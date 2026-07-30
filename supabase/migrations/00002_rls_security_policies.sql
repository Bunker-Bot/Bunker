-- ProjectVault / Bunker Row-Level Security Policies
-- Migration 00002: Zero-Trust RLS Policies

-- Enable Row-Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 1. Profiles Policies
-- ----------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ----------------------------------------------------
-- 2. Admin Full CRUD Access Policies
-- ----------------------------------------------------
CREATE POLICY "Admin full access clients"
    ON public.clients FOR ALL
    USING (auth.uid() = admin_id);

CREATE POLICY "Admin full access projects"
    ON public.projects FOR ALL
    USING (auth.uid() = admin_id);

CREATE POLICY "Admin full access milestones"
    ON public.milestones FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = milestones.project_id AND p.admin_id = auth.uid()
        )
    );

CREATE POLICY "Admin full access tasks"
    ON public.tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = tasks.project_id AND p.admin_id = auth.uid()
        )
    );

CREATE POLICY "Admin full access share_links"
    ON public.share_links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = share_links.project_id AND p.admin_id = auth.uid()
        )
    );

CREATE POLICY "Admin full access notes"
    ON public.notes FOR ALL
    USING (auth.uid() = admin_id);

-- ----------------------------------------------------
-- 3. Public Read-Only Portal Share-Link Token Policies
-- ----------------------------------------------------
CREATE POLICY "Public token access share_links"
    ON public.share_links FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Public token access projects"
    ON public.projects FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.share_links sl
            WHERE sl.project_id = projects.id
            AND sl.is_active = true
            AND (sl.expires_at IS NULL OR sl.expires_at > now())
        )
    );

CREATE POLICY "Public token access milestones"
    ON public.milestones FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.share_links sl
            WHERE sl.project_id = milestones.project_id
            AND sl.is_active = true
            AND (sl.expires_at IS NULL OR sl.expires_at > now())
        )
    );
