-- Migration 0028: Public Share Link Status Checking RLS
DROP POLICY IF EXISTS "Public token access share_links" ON public.share_links;

-- Allow public read of share_links by token to allow status checks (active, expired, revoked, view limit)
CREATE POLICY "Public token access share_links"
    ON public.share_links FOR SELECT
    USING (true);
