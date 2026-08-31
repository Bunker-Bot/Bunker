import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { SharePreviewMetadata } from './share-preview';
import { generateAvatarConfig } from '../../src/features/identity-avatar/lib/avatar-generator';

export async function renderOgImageBuffer(metadata: SharePreviewMetadata): Promise<Buffer> {
  const isAvailable = metadata.state === 'available';
  const isProtected = metadata.state === 'protected';
  const isExpired = metadata.state === 'expired';
  const isRevoked = metadata.state === 'revoked';

  const projectName = isAvailable
    ? metadata.project?.name || 'Project Deliverables'
    : isProtected
    ? 'Protected Project Vault'
    : isExpired
    ? 'Project Access Expired'
    : isRevoked
    ? 'Share Link Revoked'
    : 'Bunker Project Portal';

  const clientName = isAvailable
    ? metadata.client?.displayName || 'Valued Client'
    : isProtected
    ? 'Client Authentication Required'
    : 'Bunker Client Access';

  const description = isAvailable
    ? metadata.project?.description || 'Secure client deliverables, timeline, milestones, and project vault.'
    : isProtected
    ? 'Passcode authentication is required to access this client project vault.'
    : isExpired
    ? 'This secure share link has passed its expiration timeframe.'
    : isRevoked
    ? 'This cryptographic share link has been revoked by the workspace administrator.'
    : 'Access client deliverables and project tracking.';

  const status = isAvailable ? metadata.project?.status || 'Active' : 'Secure';
  const completionPercent = isAvailable ? metadata.project?.completionPercent ?? 75 : 0;
  const projectColor = isAvailable ? metadata.project?.color || '#06B6D4' : '#6366F1';
  const techs = isAvailable && metadata.technologies && metadata.technologies.length > 0
    ? metadata.technologies.slice(0, 3)
    : ['React', 'Supabase', 'TypeScript'];

  // Generate deterministic avatar config
  const avatarConfig = generateAvatarConfig({
    entityId: metadata.project?.id || metadata.shareLinkId || 'default-og',
    entityKind: 'project',
    name: projectName,
    preferredColor: projectColor,
    parentEntityId: metadata.client?.id || '',
  });

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

              <div
                style={{
                  display: 'flex',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  color: '#38BDF8',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {`${completionPercent}% Complete`}
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
                width: '90px',
                height: '100px',
                borderRadius: '45px 45px 20px 20px',
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
                  width: '68px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: avatarConfig.glowColor,
                }}
              />
            </div>

            {/* Shoulder Collar */}
            <div
              style={{
                width: '130px',
                height: '40px',
                borderRadius: '12px 12px 0 0',
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

        <div style={{ display: 'flex', fontSize: '12px', color: '#52525B', letterSpacing: '0.04em' }}>
          End-to-End Cryptographic Portal • Bunker Vault
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff'
          ).then((res) => res.arrayBuffer()).catch(() => new ArrayBuffer(0)),
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
