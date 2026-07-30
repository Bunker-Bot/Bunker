-- 0038_phase11_milestones_enhancements.sql
-- Migration to enhance milestones table for enterprise roadmap features

ALTER TABLE public.milestones 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_name text DEFAULT 'Project Team',
  ADD COLUMN IF NOT EXISTS labels text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version text,
  ADD COLUMN IF NOT EXISTS sprint text,
  ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dependencies jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tasks_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_tasks_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure milestone_attachments table has all fields
CREATE TABLE IF NOT EXISTS public.milestone_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text DEFAULT 'link',
  file_size text,
  uploaded_at timestamptz DEFAULT now()
);

-- Indexes for quick performance
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_sort_order ON public.milestones(sort_order);
CREATE INDEX IF NOT EXISTS idx_milestone_attachments_milestone_id ON public.milestone_attachments(milestone_id);
