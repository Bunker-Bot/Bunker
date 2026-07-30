export const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
  supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  publicAppUrl: (Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173').replace(/\/$/, ''),
  allowMultipleShareLinks: Deno.env.get('ALLOW_MULTIPLE_SHARE_LINKS') === 'true',
  shareLinkDefaultExpiry: Deno.env.get('SHARE_LINK_DEFAULT_EXPIRY') ?? '7d',
  maxShareLinksPerProject: Number(Deno.env.get('MAX_SHARE_LINKS_PER_PROJECT') ?? '50'),
  rateLimitWindowMs: Number(Deno.env.get('RATE_LIMIT_WINDOW') ?? '60000'), // 1 minute
  rateLimitRequests: Number(Deno.env.get('RATE_LIMIT_REQUESTS') ?? '10'), // 10 requests per minute
};
