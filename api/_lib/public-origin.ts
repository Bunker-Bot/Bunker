const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return null;
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.origin;
  } catch { return null; }
}

export function getPublicAppOrigin(req?: { headers?: Record<string, string | string[] | undefined> }): string {
  const configured = process.env.PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL;
  const configuredOrigin = configured ? normalizeOrigin(configured) : null;
  if (configuredOrigin) return configuredOrigin;
  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionHost && /^[a-z0-9.-]+$/i.test(vercelProductionHost)) {
    return `https://${vercelProductionHost}`;
  }
  const forwardedHost = req?.headers?.['x-forwarded-host'];
  const hostHeader = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const host = (hostHeader || req?.headers?.host || '').toString().split(',')[0].trim();
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(host) ? host : '';
  const hostname = safeHost.replace(/:\d+$/, '').toLowerCase();
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const requestedProto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || '').toString().split(',')[0].trim();
  const protocol = LOCAL_HOSTS.has(hostname) && process.env.NODE_ENV !== 'production' && requestedProto !== 'https' ? 'http' : 'https';
  if (safeHost) return `${protocol}://${safeHost}`;
  const vercelDeploymentHost = process.env.VERCEL_URL;
  if (vercelDeploymentHost && /^[a-z0-9.-]+$/i.test(vercelDeploymentHost)) {
    return `https://${vercelDeploymentHost}`;
  }
  return 'http://localhost:5173';
}
