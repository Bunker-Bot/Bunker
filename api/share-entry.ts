import { fetchSharePreviewMetadata, hashTokenSha256, type SharePreviewMetadata } from './_lib/share-preview.js';
import { getPublicAppOrigin } from './_lib/public-origin.js';

interface ApiRequest { url?: string; method?: string; headers?: Record<string, string | string[] | undefined> }
interface ApiResponse { setHeader(name: string, value: string): void; status(code: number): ApiResponse; send(body: string): void; end(): void }

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const clamp = (value: string, max: number) => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1).trimEnd()}…`;
};

export function getPreviewCopy(metadata: SharePreviewMetadata) {
  if (metadata.state === 'available') {
    const name = clamp(metadata.project?.name || 'Shared Project', 70);
    return {
      title: clamp(`${name} — Bunker`, 90),
      description: clamp(metadata.project?.safeDescription || 'Secure project workspace shared through Bunker.', 160),
      alt: clamp(`Secure Bunker project preview for ${name}`, 120),
    };
  }
  if (metadata.state === 'protected') return {
    title: 'Secure Project Access — Bunker',
    description: 'Authentication is required to access this shared project.',
    alt: 'Bunker protected project access preview',
  };
  return {
    title: 'Shared Project Unavailable — Bunker',
    description: 'This shared access link is no longer available.',
    alt: 'Bunker shared project unavailable preview',
  };
}

export function renderShareEntryHtml(input: { metadata: SharePreviewMetadata; origin: string; rawToken: string; previewId: string }) {
  const { metadata, origin, rawToken, previewId } = input;
  const copy = getPreviewCopy(metadata);
  const canonicalUrl = `${origin}/s/${encodeURIComponent(rawToken)}`;
  const destinationUrl = `/portal/${encodeURIComponent(rawToken)}`;
  const version = Math.max(1, Number(metadata.previewVersion) || 1);
  const imageUrl = `${origin}/api/og/share?id=${encodeURIComponent(previewId)}&v=${version}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(copy.title)}</title><meta name="description" content="${esc(copy.description)}"><link rel="canonical" href="${esc(canonicalUrl)}">
<meta http-equiv="refresh" content="0;url=${esc(destinationUrl)}">
<meta property="og:title" content="${esc(copy.title)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(canonicalUrl)}"><meta property="og:description" content="${esc(copy.description)}">
<meta property="og:image" content="${esc(imageUrl)}"><meta property="og:image:secure_url" content="${esc(imageUrl)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(copy.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(copy.title)}"><meta name="twitter:description" content="${esc(copy.description)}"><meta name="twitter:image" content="${esc(imageUrl)}">
<style>html{color-scheme:dark}body{margin:0;min-height:100vh;background:#050505;color:#fafafa;font:16px system-ui}</style></head>
<body><script>window.location.replace(${JSON.stringify(destinationUrl)});</script></body></html>`;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const origin = getPublicAppOrigin(req);
    const url = new URL(req.url || '/', origin);
    const rawToken = String(url.searchParams.get('token') || '').trim();
    const previewId = hashTokenSha256(rawToken);
    const metadata = await fetchSharePreviewMetadata(previewId);
    const html = renderShareEntryHtml({ metadata, origin, rawToken, previewId });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=30');
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.status(200);
    if (req.method === 'HEAD') return res.end();
    return res.send(html);
  } catch {
    const rawToken = String(new URL(req.url || '/', 'http://localhost').searchParams.get('token') || '').trim();
    const origin = getPublicAppOrigin(req);
    const html = renderShareEntryHtml({ metadata: { state: 'invalid' }, origin, rawToken, previewId: hashTokenSha256(rawToken) });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200);
    if (req.method === 'HEAD') return res.end();
    return res.send(html);
  }
}
