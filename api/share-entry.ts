import { fetchSharePreviewMetadata, hashTokenSha256 } from './_lib/share-preview';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: any, res: any) {
  try {
    const host = req.headers?.host || 'localhost';
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    const url = new URL(req.url || '', origin);
    const rawToken =
      url.searchParams.get('token') ||
      url.pathname.replace(/^\/s\//, '').replace(/^\/api\/share-entry\/?/, '') ||
      '';

    const tokenHash = hashTokenSha256(rawToken);
    const metadata = await fetchSharePreviewMetadata(rawToken || tokenHash);

    const isAvailable = metadata.state === 'available';
    const isProtected = metadata.state === 'protected';
    const isExpired = metadata.state === 'expired';
    const isRevoked = metadata.state === 'revoked';

    const title = isAvailable
      ? `${metadata.project?.name || 'Project Review'} — Bunker Vault`
      : isProtected
      ? 'Protected Project Vault — Bunker'
      : isExpired
      ? 'Link Expired — Bunker'
      : isRevoked
      ? 'Access Revoked — Bunker'
      : 'Bunker Project Portal';

    const clientDisplay = isAvailable
      ? metadata.client?.displayName || 'Valued Client'
      : 'Client Access';

    const description = isAvailable
      ? `${clientDisplay} Deliverables • ${metadata.project?.description || 'Access milestones, timeline, deliverables, and documents on Bunker.'}`
      : isProtected
      ? 'Passcode authentication required to view this project.'
      : isExpired
      ? 'This project share link is no longer available because it has expired.'
      : isRevoked
      ? 'This share link has been revoked by the project administrator.'
      : 'Secure Client Project Portal on Bunker.';

    const ogImageUrl = `${origin}/api/og/share?tokenHash=${tokenHash}`;
    const destinationUrl = `/share/${encodeURIComponent(rawToken)}`;

    const html = `<!doctype html>
<html lang="en" class="dark" style="color-scheme: dark; background: #09090B;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bunker" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(`${origin}/share/${rawToken}`)}" />
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destinationUrl)}" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090B;
      color: #FAFAFA;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: #121318;
      border: 1px solid #27272A;
      border-radius: 8px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #064E3B;
      border: 1px solid #059669;
      color: #6EE7B7;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #FFFFFF;
    }
    .desc {
      font-size: 12px;
      color: #A1A1AA;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background: #FFFFFF;
      color: #000000;
      text-decoration: none;
      font-weight: bold;
      font-size: 12px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #E4E4E7;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #27272A;
      border-top-color: #06B6D4;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <div class="badge">Zero-Trust Exchange</div>
    <div class="title">Opening Secure Portal…</div>
    <div class="desc">${escapeHtml(description)}</div>
    <a href="${escapeHtml(destinationUrl)}" class="btn">Open Client Portal</a>
  </div>
  <script>
    try {
      window.location.replace("${escapeHtml(destinationUrl)}");
    } catch(e) {
      window.location.href = "${escapeHtml(destinationUrl)}";
    }
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.status(200).send(html);
  } catch (err: any) {
    console.error('[api/share-entry] Error rendering share entry:', err);
    res.status(500).send('Internal Server Error');
  }
}
