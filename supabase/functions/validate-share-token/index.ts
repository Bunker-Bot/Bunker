import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashTokenSHA256(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPasswordSecurely(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`bunker_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, password } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Share token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Compute SHA-256 hash of token to compare with stored token hash
    const tokenHash = await hashTokenSHA256(token);

    // 1. Fetch share link record by token_hash or token (for backwards compatibility)
    const { data: shareLinks, error } = await supabaseAdmin
      .from('share_links')
      .select('id, project_id, token, password_hash, expires_at, is_active, view_count, max_views, permissions')
      .or(`token.eq.${tokenHash},token.eq.${token}`);

    const shareLink = shareLinks && shareLinks.length > 0 ? shareLinks[0] : null;

    if (error || !shareLink) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired share link' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Validate Active Status
    if (!shareLink.is_active) {
      return new Response(JSON.stringify({ success: false, error: 'Share link has been revoked' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Validate Expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'Share link has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Validate Max Views Limit
    if (shareLink.max_views && shareLink.view_count >= shareLink.max_views) {
      return new Response(JSON.stringify({ success: false, error: 'Maximum view limit reached' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Validate Password if required
    if (shareLink.password_hash) {
      if (!password) {
        return new Response(JSON.stringify({ success: false, requiresPassword: true }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const inputPwdHash = await hashPasswordSecurely(password);

      if (inputPwdHash !== shareLink.password_hash && password !== shareLink.password_hash) {
        return new Response(JSON.stringify({ success: false, error: 'Incorrect password' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 6. Update audit log metrics & analytics
    await supabaseAdmin
      .from('share_links')
      .update({
        view_count: (shareLink.view_count || 0) + 1,
        last_access_at: new Date().toISOString(),
      })
      .eq('id', shareLink.id);

    // Log view event
    try {
      await supabaseAdmin.from('share_link_events').insert({
        share_link_id: shareLink.id,
        event_type: 'view',
        created_at: new Date().toISOString(),
      });
    } catch (_evtErr) {
      // Non-blocking
    }

    // 7. Return scoped viewer access payload
    return new Response(
      JSON.stringify({
        success: true,
        projectId: shareLink.project_id,
        permissions: shareLink.permissions || {},
        role: 'viewer',
        expiresInSeconds: 900, // 15 minutes
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
