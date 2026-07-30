export const CONFIG = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  WEBHOOK_SECRET: Deno.env.get('ACTIVITY_LOGGER_WEBHOOK_SECRET') || '',
};

export async function verifyWebhookSignature(req: Request, bodyText: string): Promise<boolean> {
  const secret = CONFIG.WEBHOOK_SECRET;
  if (!secret) return true; // Skip signature check if secret is not configured in dev

  const signature = req.headers.get('x-supabase-signature') || req.headers.get('x-signature');
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(bodyText));
}
