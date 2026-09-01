import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { SharePreviewMetadata } from './share-preview.js';

interface ServerAvatarConfig {
  headVariant: number;
  visorVariant: number;
  shoulderVariant: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
}

function fallbackAvatarConfig(seed: string, preferredColor: string): ServerAvatarConfig {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return {
    headVariant: hash % 10,
    visorVariant: (hash >>> 4) % 8,
    shoulderVariant: (hash >>> 8) % 6,
    primaryColor: preferredColor,
    secondaryColor: '#27272A',
    accentColor: '#67E8F9',
    glowColor: '#22D3EE',
  };
}

let fontPromise: Promise<Buffer> | undefined;
const getBundledFont = () => fontPromise ||= readFile(resolve(process.cwd(), 'node_modules/harfbuzzjs/test/fonts/noto/NotoSans-Regular.ttf'));
const truncate = (value: string, max: number) => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

export async function renderOgImageBuffer(metadata: SharePreviewMetadata): Promise<Buffer> {
  const isAvailable = metadata.state === 'available';
  const isProtected = metadata.state === 'protected';
  const isExpired = metadata.state === 'expired';
  const isRevoked = metadata.state === 'revoked';

  const projectName = isAvailable
    ? truncate(metadata.project?.name || 'Project Deliverables', 70)
    : isProtected
    ? 'Protected Project Vault'
    : isExpired
    ? 'Project Access Expired'
    : isRevoked
    ? 'Share Link Revoked'
    : 'Bunker Project Portal';

  const clientName = isAvailable
    ? truncate(metadata.client?.displayName || 'Valued Client', 48)
    : isProtected
    ? 'Client Authentication Required'
    : 'Bunker Client Access';

  const description = isAvailable
    ? metadata.project?.safeDescription || 'Secure project workspace shared through Bunker.'
    : isProtected
    ? 'Passcode authentication is required to access this client project vault.'
    : isExpired
    ? 'This secure share link has passed its expiration timeframe.'
    : isRevoked
    ? 'This cryptographic share link has been revoked by the workspace administrator.'
    : 'Access client deliverables and project tracking.';

  const status = isAvailable ? metadata.project?.status || 'Active' : 'Secure';
  const projectColor = isAvailable ? metadata.project?.color || '#06B6D4' : '#6366F1';
  const techs = isAvailable && metadata.technologies && metadata.technologies.length > 0
    ? metadata.technologies.slice(0, 3)
    : ['React', 'Supabase', 'TypeScript'];

  // Generate deterministic avatar config
  const generatedConfig = fallbackAvatarConfig(
    metadata.project?.id || metadata.shareLinkId || projectName,
    projectColor
  );
  const storedConfig = metadata.avatar?.config || metadata.project?.avatarConfig;
  const avatarConfig = storedConfig && typeof storedConfig === 'object'
    ? { ...generatedConfig, ...storedConfig } as ServerAvatarConfig
    : generatedConfig;
  const guardianCode = metadata.avatar?.code || metadata.project?.avatarCode;

  // Render SVG via Satori
  const svg = await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#09090B',
        backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(6, 182, 212, 0.15), transparent 45%), radial-gradient(circle at 15% 80%, rgba(99, 102, 241, 0.12), transparent 40%)',
        padding: '50px 60px',
        fontFamily: 'sans-serif',
        color: '#FAFAFA',
        border: '12px solid #14151A',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#18181B',
              border: '1.5px solid #27272A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
              color: '#06B6D4',
            }}
          >
            B
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.12em', color: '#FFFFFF' }}>
              BUNKER
            </span>
            <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: '#71717A', textTransform: 'uppercase' }}>
              Project Vault
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#121316',
            border: '1px solid #27272A',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isAvailable ? '#10B981' : isProtected ? '#F59E0B' : '#EF4444',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#E4E4E7', textTransform: 'uppercase' }}>
            {isAvailable ? 'Secure Client Portal' : isProtected ? 'Password Protected' : 'Link Unavailable'}
          </span>
        </div>
      </div>

      {/* 2. Middle Content Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', margin: '20px 0' }}>
        {/* Left Column: Project Info */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px', maxWidth: '640px' }}>
          {/* Client Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: 600 }}>Client:</span>
            <span style={{ fontSize: '14px', color: '#38BDF8', fontWeight: 700 }}>{clientName}</span>
          </div>

          {/* Project Title */}
          <div
            style={{
              display: 'flex',
              fontSize: projectName.length > 25 ? '38px' : '46px',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            {projectName}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', fontSize: '16px', color: '#A1A1AA', lineHeight: 1.4, maxWidth: '580px' }}>
            {description}
          </div>

          {/* Status & Progress Row */}
          {isAvailable && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#064E3B',
                  border: '1px solid #059669',
                  color: '#6EE7B7',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {status}
              </div>

            </div>
          )}
        </div>

        {/* Right Column: 3D Guardian Visual Poster Art */}
        <div
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '16px',
            backgroundColor: '#121318',
            border: '2px solid #27272A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Spatial Halo Glow */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: avatarConfig.glowColor,
              opacity: 0.25,
            }}
          />

          {/* Guardian Minimalist Vector Representation */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Head Shell */}
            <div
              style={{
                width: avatarConfig.headVariant % 3 === 1 ? '104px' : '90px',
                height: avatarConfig.headVariant % 3 === 2 ? '112px' : '100px',
                borderRadius: avatarConfig.headVariant % 3 === 0 ? '45px 45px 20px 20px' : avatarConfig.headVariant % 3 === 1 ? '12px 12px 24px 24px' : '28px 28px 10px 10px',
                backgroundColor: avatarConfig.secondaryColor,
                border: '3px solid #3F3F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Visor Bar */}
              <div
                style={{
                  width: avatarConfig.visorVariant % 3 === 1 ? '54px' : '68px',
                  height: avatarConfig.visorVariant % 3 === 2 ? '8px' : '16px',
                  borderRadius: avatarConfig.visorVariant % 3 === 0 ? '8px' : '3px',
                  backgroundColor: avatarConfig.glowColor,
                }}
              />
            </div>

            {/* Shoulder Collar */}
            <div
              style={{
                width: avatarConfig.shoulderVariant % 3 === 2 ? '170px' : avatarConfig.shoulderVariant % 3 === 1 ? '145px' : '130px',
                height: avatarConfig.shoulderVariant % 3 === 2 ? '48px' : '40px',
                borderRadius: avatarConfig.shoulderVariant % 2 === 0 ? '12px 12px 0 0' : '28px 28px 0 0',
                backgroundColor: avatarConfig.primaryColor,
                border: '2px solid #27272A',
                marginTop: '-8px',
                display: 'flex',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Footer Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #1E2026',
          paddingTop: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {techs.map((t, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#18181B',
                border: '1px solid #27272A',
                fontSize: '11px',
                color: '#A1A1AA',
                fontWeight: 600,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', fontSize: '12px', color: '#71717A', letterSpacing: '0.04em' }}>
          {guardianCode ? `Guardian #${guardianCode} • ` : ''}Secure Project Portal • Bunker
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await getBundledFont(),
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  // Convert SVG to PNG Buffer via Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

/** Dependency-light last-resort card; always produces a real 1200×630 PNG. */
export function renderFallbackOgImageBuffer(): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#09090b"/><rect x="48" y="48" width="1104" height="534" rx="18" fill="#121318" stroke="#27272a" stroke-width="2"/><text x="90" y="145" fill="#67e8f9" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="5">BUNKER</text><text x="90" y="310" fill="#fafafa" font-family="Arial,sans-serif" font-size="52" font-weight="700">Shared Project</text><text x="90" y="365" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="25">Secure project access through Bunker.</text><text x="90" y="525" fill="#71717a" font-family="Arial,sans-serif" font-size="20">SECURE PORTAL</text></svg>`;
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
