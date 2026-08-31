import React, { lazy, Suspense, useState, useMemo, useEffect } from 'react';
import type { AvatarIdentityInput, BunkerAvatarConfig } from '../types/avatar.types';
import { generateAvatarConfig } from '../lib/avatar-generator';
import { checkSystemCapabilities } from '../lib/avatar-capabilities';
import { AvatarPoster } from './AvatarPoster';
import { AvatarErrorBoundary } from './AvatarErrorBoundary';

// Lazy-load Three.js WebGL canvas so pages without avatars never download 3D code
const LazyCanvas = lazy(() => import('./IdentityAvatarCanvas'));

export interface IdentityAvatar3DProps {
  input?: AvatarIdentityInput;
  config?: BunkerAvatarConfig;
  className?: string;
  size?: number | string;
  badgeLogoUrl?: string | null;
  badgeText?: string | null;
  showBackdrop?: boolean;
}

export const IdentityAvatar3D: React.FC<IdentityAvatar3DProps> = ({
  input,
  config: providedConfig,
  className = '',
  size = '100%',
  badgeLogoUrl,
  badgeText,
  showBackdrop = true,
}) => {
  // Deterministic config derivation
  const config = useMemo(() => {
    if (providedConfig) return providedConfig;
    if (input) return generateAvatarConfig(input);
    return generateAvatarConfig({
      entityId: 'bunker-default',
      entityKind: 'generic',
      name: 'Bunker Guardian',
    });
  }, [providedConfig, input]);

  const [capabilities, setCapabilities] = useState<{ hasWebGL: boolean }>({ hasWebGL: false });
  const [is3DReady, setIs3DReady] = useState(false);

  useEffect(() => {
    setCapabilities(checkSystemCapabilities());
  }, []);

  const effectiveBadgeLogo = badgeLogoUrl !== undefined ? badgeLogoUrl : input?.logoUrl;

  // Fallback to SVG poster if WebGL is unavailable
  if (!capabilities.hasWebGL) {
    return (
      <AvatarPoster
        config={config}
        className={className}
        size={size}
        showBackdrop={showBackdrop}
        badgeLogoUrl={effectiveBadgeLogo}
        badgeText={badgeText}
      />
    );
  }

  return (
    <AvatarErrorBoundary
      config={config}
      className={className}
      size={size}
      badgeLogoUrl={effectiveBadgeLogo}
      badgeText={badgeText}
    >
      <div
        className={`relative flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size, aspectRatio: '1/1' }}
      >
        {/* Instant Static SVG Poster (Always rendered first for 0ms layout stability) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out ${
            is3DReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AvatarPoster
            config={config}
            className="w-full h-full"
            size="100%"
            showBackdrop={showBackdrop}
            badgeLogoUrl={effectiveBadgeLogo}
            badgeText={badgeText}
          />
        </div>

        {/* Interactive 3D WebGL Canvas (Crossfades in smoothly once shader pipeline is compiled) */}
        <Suspense fallback={null}>
          <div
            className={`absolute inset-0 transition-opacity duration-500 ease-in ${
              is3DReady ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <LazyCanvas config={config} onLoaded={() => setIs3DReady(true)} />
          </div>
        </Suspense>

        {/* Verified Client Badge Overlay in 3D Mode */}
        {is3DReady && (effectiveBadgeLogo || badgeText) && (
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10 pointer-events-none">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm bg-zinc-950/90 border border-zinc-700/80 p-0.5 flex items-center justify-center shadow-lg backdrop-blur-xs">
              {effectiveBadgeLogo ? (
                <img
                  src={effectiveBadgeLogo}
                  alt="Client Brand"
                  className="w-full h-full object-contain rounded-xs"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-[9px] font-mono font-extrabold text-white">
                  {badgeText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </AvatarErrorBoundary>
  );
};

export default IdentityAvatar3D;
