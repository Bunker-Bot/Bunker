import { fetchSharePreviewMetadata } from '../_lib/share-preview';
import { renderFallbackOgImageBuffer, renderOgImageBuffer } from '../_lib/og-renderer';

interface ApiRequest { url?: string; method?: string; headers?: Record<string, string | string[] | undefined> }
interface ApiResponse { setHeader(name: string, value: string): void; status(code: number): ApiResponse; send(body: Buffer): void; end(): void }

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const tokenHash = url.searchParams.get('id') || '';

    const metadata = await fetchSharePreviewMetadata(tokenHash);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Cache-Control',
      metadata.state === 'available'
        ? 'public, max-age=300, s-maxage=300, stale-while-revalidate=60'
        : 'public, max-age=0, s-maxage=60, must-revalidate'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200);
    if (req.method === 'HEAD') return res.end();
    const pngBuffer = await renderOgImageBuffer(metadata).catch(() => renderFallbackOgImageBuffer());
    return res.send(pngBuffer);
  } catch {
    console.error('[api/og/share] Error category: preview_render_failure');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, must-revalidate');
    res.status(200);
    if (req.method === 'HEAD') return res.end();
    return res.send(renderFallbackOgImageBuffer());
  }
}
