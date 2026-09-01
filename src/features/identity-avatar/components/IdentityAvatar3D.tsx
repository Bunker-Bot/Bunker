import React, { useMemo } from 'react';
import type { AvatarIdentityInput, BunkerAvatarConfig } from '../types/avatar.types';
import { generateAvatarConfig } from '../lib/avatar-generator';
import { AvatarPoster } from './AvatarPoster';
import { AvatarErrorBoundary } from './AvatarErrorBoundary';

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

  const effectiveBadgeLogo = badgeLogoUrl !== undefined ? badgeLogoUrl : input?.logoUrl;

  return (
    <AvatarErrorBoundary
      config={config}
      className={className}
      size={size}
      badgeLogoUrl={effectiveBadgeLogo}
      badgeText={badgeText}
    >
      <AvatarPoster
        config={config}
        className={`w-full h-full ${className}`}
        size={size}
        showBackdrop={showBackdrop}
        badgeLogoUrl={effectiveBadgeLogo}
        badgeText={badgeText}
      />
    </AvatarErrorBoundary>
  );
};

export default IdentityAvatar3D;
