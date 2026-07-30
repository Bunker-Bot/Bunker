-- Migration 0030: Atomic Share Link View Logger RPC
-- Increments view_count, updates last_access_at, and writes analytics event safely

CREATE OR REPLACE FUNCTION public.record_share_link_view(p_share_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Increment view_count and update last_access_at atomically
  UPDATE public.share_links
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_access_at = now()
  WHERE id = p_share_link_id;

  -- 2. Insert view event into share_link_events if table exists
  BEGIN
    INSERT INTO public.share_link_events (
      share_link_id,
      event_type,
      created_at
    ) VALUES (
      p_share_link_id,
      'view',
      now()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback ignore if events table is missing
    NULL;
  END;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.record_share_link_view(uuid) TO anon, authenticated;
