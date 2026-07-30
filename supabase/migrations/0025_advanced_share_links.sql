-- ProjectVault / Bunker Advanced Share Link Management & Analytics
-- Migration 0025: Advanced Share Link Schema & Event Tracking

-- 1. Extend share_links table
ALTER TABLE public.share_links
ADD COLUMN IF NOT EXISTS name text DEFAULT 'Client Review',
ADD COLUMN IF NOT EXISTS max_views integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{"overview": true, "timeline": true, "milestones": true, "screenshots": true, "documents": true, "files": true, "deployments": true, "github": true, "changelog": true}',
ADD COLUMN IF NOT EXISTS unique_visitors integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_downloads integer DEFAULT 0;

-- 2. Create share_link_events table for privacy-safe analytics
CREATE TABLE IF NOT EXISTS public.share_link_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'password_verify', 'download', 'section_view')),
  country text,
  city text,
  browser text,
  os text,
  device_type text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Index for event lookups
CREATE INDEX IF NOT EXISTS idx_share_link_events_link_id ON public.share_link_events(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_link_events_created ON public.share_link_events(created_at DESC);

-- Enable RLS on share_link_events
ALTER TABLE public.share_link_events ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "admin_full_access" ON public.share_link_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
