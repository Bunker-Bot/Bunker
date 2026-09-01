const publicAppUrl = (() => {
  const value = (Deno.env.get('PUBLIC_APP_URL') ?? '').replace(/\/$/, '');
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
    return url.origin;
  } catch {
    throw new Error('PUBLIC_APP_URL must be configured as the production HTTPS origin');
  }
})();

export const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
  supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  publicAppUrl,
  allowMultipleShareLinks: Deno.env.get('ALLOW_MULTIPLE_SHARE_LINKS') === 'true',
  shareLinkDefaultExpiry: Deno.env.get('SHARE_LINK_DEFAULT_EXPIRY') ?? '7d',
  maxShareLinksPerProject: Number(Deno.env.get('MAX_SHARE_LINKS_PER_PROJECT') ?? '50'),
  rateLimitWindowMs: Number(Deno.env.get('RATE_LIMIT_WINDOW') ?? '60000'), // 1 minute
  rateLimitRequests: Number(Deno.env.get('RATE_LIMIT_REQUESTS') ?? '10'), // 10 requests per minute
};
