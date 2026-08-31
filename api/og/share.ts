import type { IncomingMessage, ServerResponse } from 'http';
import { fetchSharePreviewMetadata } from '../_lib/share-preview';
import { renderOgImageBuffer } from '../_lib/og-renderer';

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const tokenHash =
      url.searchParams.get('tokenHash') ||
      url.searchParams.get('token') ||
      url.searchParams.get('id') ||
      '';

    const metadata = await fetchSharePreviewMetadata(tokenHash);
    const pngBuffer = await renderOgImageBuffer(metadata);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Cache-Control',
      metadata.state === 'available'
        ? 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
        : 'public, max-age=300, s-maxage=300, no-cache'
    );
    res.status(200).send(pngBuffer);
  } catch (err: any) {
    console.error('[api/og/share] Error generating OG image:', err);
    res.status(500).send(Buffer.from(''));
  }
}
