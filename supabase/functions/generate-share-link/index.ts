import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { config } from './config.ts';
import { processGenerateShareLink } from './service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        code: 'UNKNOWN_ERROR',
        message: 'Method not allowed. Use POST.',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // 1. Verify Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const jwtToken = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

    // 2. Authenticate Invoking Administrator User
    const { data: userData, error: authErr } = await supabaseAdmin.auth.getUser(jwtToken);
    if (authErr || !userData?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Unauthorized administrator access.',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = userData.user.id;
    const idempotencyKey = req.headers.get('Idempotency-Key');

    // 3. Parse JSON Body
    const body = await req.json().catch(() => ({}));

    // 4. Delegate to Business Logic Service
    const result = await processGenerateShareLink(userId, body, idempotencyKey);

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[generate-share-link] Controller error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Internal server error occurred.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
