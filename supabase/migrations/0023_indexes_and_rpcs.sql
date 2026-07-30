-- ProjectVault / Bunker Enterprise RPC Functions & High-Performance Indexes
-- Migration 0023: Indexes, RPC Aggregates & Database Optimization

-- ----------------------------------------------------
-- 1. High-Performance B-Tree Indexes
-- ----------------------------------------------------

-- Projects Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at_desc ON public.projects(created_at DESC);

-- Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_sort ON public.tasks(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_due ON public.tasks(project_id, due_date);

-- Milestones Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id_sort ON public.milestones(project_id, sort_order);

-- Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Share Links Indexes
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_project_id ON public.share_links(project_id);
CREATE INDEX IF NOT EXISTS idx_share_links_active_expires ON public.share_links(is_active, expires_at);

-- Files & Folders Indexes
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON public.files(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_project_id ON public.folders(project_id);

-- ----------------------------------------------------
-- 2. Enterprise RPC Functions
-- ----------------------------------------------------

-- Dashboard Summary RPC (1 request instead of 15 queries)
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_total_projects INT;
    v_active_projects INT;
    v_completed_projects INT;
    v_total_clients INT;
    v_recent_projects jsonb;
    v_recent_activity jsonb;
BEGIN
    -- Only allow authenticated admin users
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin credentials required.';
    END IF;

    SELECT COUNT(*) INTO v_total_projects FROM public.projects;
    SELECT COUNT(*) INTO v_active_projects FROM public.projects WHERE status IN ('planning', 'active');
    SELECT COUNT(*) INTO v_completed_projects FROM public.projects WHERE status = 'completed';
    SELECT COUNT(*) INTO v_total_clients FROM public.clients;

    -- Aggregate top 5 recent projects with minimal columns
    SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) INTO v_recent_projects
    FROM (
        SELECT id, name, slug, status, progress, deadline, created_at
        FROM public.projects
        ORDER BY created_at DESC
        LIMIT 5
    ) p;

    -- Aggregate top 10 recent activity logs
    SELECT COALESCE(jsonb_agg(a), '[]'::jsonb) INTO v_recent_activity
    FROM (
        SELECT id, action, entity_type, entity_id, created_at
        FROM public.activity_logs
        ORDER BY created_at DESC
        LIMIT 10
    ) a;

    RETURN jsonb_build_object(
        'projectCount', v_total_projects,
        'activeProjects', v_active_projects,
        'completedProjects', v_completed_projects,
        'clientCount', v_total_clients,
        'recentProjects', v_recent_projects,
        'recentActivity', v_recent_activity
    );
END;
$$;

-- Project Overview RPC (Fetches project metadata & milestone metrics in one RPC call)
CREATE OR REPLACE FUNCTION public.get_project_overview(target_project uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_project jsonb;
    v_milestones jsonb;
    v_task_counts jsonb;
BEGIN
    IF NOT (public.is_admin() OR public.is_project_viewer(target_project)) THEN
        RAISE EXCEPTION 'Access denied for project %', target_project;
    END IF;

    -- Get Project Metadata
    SELECT row_to_json(p)::jsonb INTO v_project
    FROM public.projects p
    WHERE p.id = target_project;

    IF v_project IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get Milestones
    SELECT COALESCE(jsonb_agg(m), '[]'::jsonb) INTO v_milestones
    FROM (
        SELECT id, name, progress, due_date, status, sort_order
        FROM public.milestones
        WHERE project_id = target_project
        ORDER BY sort_order ASC
    ) m;

    -- Get Task status counts
    SELECT jsonb_build_object(
        'todo', COUNT(*) FILTER (WHERE status = 'todo'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'review', COUNT(*) FILTER (WHERE status = 'review'),
        'testing', COUNT(*) FILTER (WHERE status = 'testing'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed')
    ) INTO v_task_counts
    FROM public.tasks
    WHERE project_id = target_project;

    RETURN jsonb_build_object(
        'project', v_project,
        'milestones', v_milestones,
        'taskCounts', v_task_counts
    );
END;
$$;

-- Global Unified Search RPC
CREATE OR REPLACE FUNCTION public.search_everything(search_term text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_projects jsonb;
    v_clients jsonb;
    v_tasks jsonb;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) INTO v_projects
    FROM (
        SELECT id, name, slug, status, 'project' as type
        FROM public.projects
        WHERE name ILIKE '%' || search_term || '%' OR description ILIKE '%' || search_term || '%'
        LIMIT 5
    ) p;

    SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) INTO v_clients
    FROM (
        SELECT id, name, company, email, 'client' as type
        FROM public.clients
        WHERE name ILIKE '%' || search_term || '%' OR company ILIKE '%' || search_term || '%'
        LIMIT 5
    ) c;

    SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_tasks
    FROM (
        SELECT id, project_id, title, status, 'task' as type
        FROM public.tasks
        WHERE title ILIKE '%' || search_term || '%'
        LIMIT 5
    ) t;

    RETURN jsonb_build_object(
        'projects', v_projects,
        'clients', v_clients,
        'tasks', v_tasks
    );
END;
$$;
