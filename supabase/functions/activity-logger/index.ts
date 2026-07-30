import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG, verifyWebhookSignature } from './config.ts';
import { WebhookPayload } from './types.ts';
import { HANDLER_REGISTRY } from './handlers/index.ts';

const processedEvents = new Set<string>();

serve(async (req: Request) => {
  const startTime = performance.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-signature',
      },
    });
  }

  try {
    const bodyText = await req.text();

    // 1. Signature Verification
    const isValidSignature = await verifyWebhookSignature(req, bodyText);
    if (!isValidSignature) {
      return new Response(JSON.stringify({ error: 'Unauthorized webhook signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: WebhookPayload = JSON.parse(bodyText);
    if (!payload.table || !payload.type) {
      return new Response(JSON.stringify({ error: 'Invalid payload structure' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Idempotency Check
    const eventId = `${payload.table}_${payload.type}_${payload.record?.id || payload.old_record?.id}_${payload.timestamp || ''}`;
    if (processedEvents.has(eventId)) {
      return new Response(JSON.stringify({ message: 'Ignored duplicate webhook event', eventId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    processedEvents.add(eventId);
    if (processedEvents.size > 1000) {
      const oldestKey = processedEvents.values().next().value;
      if (oldestKey) processedEvents.delete(oldestKey);
    }

    // 3. Resolve Entity Handler
    const handler = HANDLER_REGISTRY[payload.table];
    if (!handler) {
      return new Response(JSON.stringify({ message: `No activity log handler for table ${payload.table}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const activityData = handler(payload);
    if (!activityData) {
      return new Response(JSON.stringify({ message: 'No activity log generated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Insert into activity_logs using Service Role Key
    const supabaseAdmin = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY);
    const { error: insertError } = await supabaseAdmin.from('activity_logs').insert(activityData);

    if (insertError) {
      console.error('[activity-logger] Insert error:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const duration = Math.round(performance.now() - startTime);

    return new Response(
      JSON.stringify({
        success: true,
        action: activityData.action,
        entity: activityData.entity_type,
        durationMs: duration,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[activity-logger] Execution error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
