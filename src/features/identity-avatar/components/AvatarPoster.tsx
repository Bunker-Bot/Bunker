import React, { useId, useMemo } from 'react';
import type { AvatarPosterProps } from '../types/avatar.types';
import { resolveGuardianGeometry } from '../lib/guardian-geometry.resolver';

export const AvatarPoster: React.FC<AvatarPosterProps> = ({
  config,
  className = '',
  size = '100%',
  interactive = false,
  showBackdrop = true,
  badgeLogoUrl = null,
  badgeText = null,
  lookAtOffset,
}) => {
  const id = useId().replace(/:/g, '-');

  // 1. Resolve Canonical Geometry Sockets & Normalized Proportions
  const geom = useMemo(() => resolveGuardianGeometry(config), [config]);

  const {
    headVariant,
    visorVariant,
    shoulderVariant,
    primaryColor,
    secondaryColor,
    accentColor,
    visorTint,
    glowColor,
    emblemVariant,
  } = config;

  // Gaze Tracking Offsets passed from hover / parent
  const gazeX = lookAtOffset ? lookAtOffset.x * 6 : 0;
  const gazeY = lookAtOffset ? lookAtOffset.y * 4 : 0;

  // Single head-pivot transform (all facial elements follow together)
  const headPivotX = gazeX;
  const headPivotY = gazeY;

  // Sockets with dynamic parallax
  const visorDepthX = gazeX * 0.45;
  const visorDepthY = gazeY * 0.45;

  // Torso subtle shift
  const torsoX = gazeX * 0.15;
  const torsoY = gazeY * 0.1;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none overflow-hidden ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Spatial Radial Background Glow */}
          <radialGradient
            id={`${id}-bg-glow`}
            cx="50%"
            cy="45%"
            r="55%"
            fx="50%"
            fy="45%"
          >
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.28" />
            <stop offset="60%" stopColor={accentColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Primary Helmet Material Gradient */}
          <linearGradient id={`${id}-helmet-grad`} x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          {/* Specular Rim Highlight Gradient */}
          <linearGradient id={`${id}-specular-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="35%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Visor Luminescent Glass Gradient */}
          <linearGradient id={`${id}-visor-grad`} x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="40%" stopColor={visorTint} />
            <stop offset="100%" stopColor="#050810" />
          </linearGradient>

          {/* Shoulder Mantle Gradient */}
          <linearGradient id={`${id}-mantle-grad`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor="#0D0E12" />
          </linearGradient>

          {/* Plinth Base Gradient */}
          <linearGradient id={`${id}-plinth-grad`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#141418" />
            <stop offset="50%" stopColor="#22242B" />
            <stop offset="100%" stopColor="#101114" />
          </linearGradient>

          {/* Visor Glow Filter */}
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* =================================================================== */}
        {/* 1. AMBIENT BACKDROP HALO & ORBITAL RINGS                            */}
        {/* =================================================================== */}
        {showBackdrop && (
          <g>
            <circle cx="120" cy="115" r="95" fill={`url(#${id}-bg-glow)`} />
            <circle
              cx="120"
              cy="115"
              r="82"
              stroke={accentColor}
              strokeWidth="0.75"
              strokeDasharray="4 6"
              strokeOpacity="0.35"
            />
            <circle
              cx="120"
              cy="115"
              r="104"
              stroke={glowColor}
              strokeWidth="0.5"
              strokeDasharray="1 9"
              strokeOpacity="0.25"
            />
          </g>
        )}

        {/* =================================================================== */}
        {/* 2. GROUNDED PEDESTAL PLINTH (Physical Foundation with Mount Socket) */}
        {/* =================================================================== */}
        <g id="plinth-root">
          {/* Ground Contact Shadow */}
          <ellipse cx="120" cy="222" rx="58" ry="7.5" fill="#000000" fillOpacity="0.7" />

          {(geom.plinth.variant === 0 || geom.plinth.variant === 3) && (
            // Beveled Octagonal Monolith / Disc
            <path
              d="M 64 210 L 84 195 L 156 195 L 176 210 L 156 218 L 84 218 Z"
              fill={`url(#${id}-plinth-grad)`}
              stroke="#2A2D35"
              strokeWidth="0.75"
            />
          )}

          {geom.plinth.variant === 1 && (
            // Dual Ring Plinth
            <g>
              <ellipse cx="120" cy="210" rx="56" ry="8.5" fill={`url(#${id}-plinth-grad)`} stroke="#2A2D35" strokeWidth="0.75" />
              <ellipse cx="120" cy="204" rx="44" ry="6" stroke={accentColor} strokeWidth="1.2" strokeOpacity="0.8" fill="none" />
            </g>
          )}

          {(geom.plinth.variant === 2 || geom.plinth.variant === 4) && (
            // Hexagonal Chiseled Base / Architect Pedestal
            <polygon
              points="68,210 88,196 152,196 172,210 152,219 88,219"
              fill={`url(#${id}-plinth-grad)`}
              stroke="#2A2D35"
              strokeWidth="0.75"
            />
          )}

          {/* Pedestal Top Mount Cavity / Accent Ring */}
          <ellipse
            cx="120"
            cy="198"
            rx="32"
            ry="4.5"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeOpacity="0.75"
            fill="#121318"
          />
        </g>

        {/* =================================================================== */}
        {/* 3. TORSO ROOT & SHOULDER MANTLE (Physically Anchored to Plinth)     */}
        {/* =================================================================== */}
        <g id="torso-root" transform={`translate(${torsoX}, ${torsoY})`}>
          {/* Lower Bust Stem / Plinth Mount Bridge (Eliminates all empty gaps!) */}
          <path
            d="M 94 180 L 102 200 L 138 200 L 146 180 Z"
            fill="#16181E"
            stroke="#272A33"
            strokeWidth="0.75"
          />

          {/* Central Chest Armor Plate & Symmetrical Shoulder Wings */}
          {(shoulderVariant === 0 || shoulderVariant === 3) && (
            // Angular High-Collar Mantle / Compact Guard
            <g>
              <path
                d="M 44 196 L 76 150 L 108 160 L 132 160 L 164 150 L 196 196 L 146 202 L 94 202 Z"
                fill={`url(#${id}-mantle-grad)`}
                stroke="#27272A"
                strokeWidth="1"
              />
              {/* Chest Accent Trim */}
              <line x1="88" y1="172" x2="152" y2="172" stroke={accentColor} strokeWidth="1.2" strokeOpacity="0.7" />
            </g>
          )}

          {(shoulderVariant === 1 || shoulderVariant === 5) && (
            // Curved Minimalist Shoulders / Blade Sweep
            <g>
              <path
                d="M 48 195 Q 74 152 120 154 Q 166 152 192 195 L 144 202 L 96 202 Z"
                fill={`url(#${id}-mantle-grad)`}
                stroke="#27272A"
                strokeWidth="1"
              />
              {/* Curved Chest Trim */}
              <path
                d="M 92 174 Q 120 180 148 174"
                stroke={accentColor}
                strokeWidth="1.2"
                strokeOpacity="0.7"
                fill="none"
              />
            </g>
          )}

          {(shoulderVariant === 2 || shoulderVariant === 4) && (
            // Tiered Command Chassis / Citadel Heavy
            <g>
              <path
                d="M 38 198 L 70 154 L 170 154 L 202 198 L 146 203 L 94 203 Z"
                fill={`url(#${id}-mantle-grad)`}
                stroke="#27272A"
                strokeWidth="1"
              />
              <path
                d="M 70 154 L 120 164 L 170 154"
                stroke={accentColor}
                strokeWidth="1.5"
                strokeOpacity="0.8"
                fill="none"
              />
            </g>
          )}

          {/* Neck Pillar & Collar Collar (Bridges Upper Torso directly into Head Shell) */}
          <g id="neck-pillar">
            {/* Structural Neck Column */}
            <path
              d="M 106 132 L 134 132 L 130 162 L 110 162 Z"
              fill="#121316"
              stroke="#242730"
              strokeWidth="0.75"
            />
            {/* Neck Mechanical Bevel Ring */}
            <ellipse cx="120" cy="158" rx="16" ry="3.5" fill="#1C1E26" stroke="#2D313D" strokeWidth="0.75" />
            <line x1="108" y1="145" x2="132" y2="145" stroke="#252833" strokeWidth="1" />
          </g>

          {/* ================================================================= */}
          {/* 4. HEAD PIVOT (Parent of Head Shell, Ears, Visor & Emblem)        */}
          {/* ================================================================= */}
          <g id="head-pivot" transform={`translate(${headPivotX}, ${headPivotY})`}>
            {/* Main Head Shell (Securely seated over neck with zero floating gap) */}
            {(headVariant === 0 || headVariant === 2 || headVariant === 7) && (
              // Vault Dome Head / Aero Capsule / Specter
              <path
                d="M 82 80 C 82 50, 158 50, 158 80 L 154 142 C 154 152, 142 156, 120 156 C 98 156, 86 152, 86 142 Z"
                fill={`url(#${id}-helmet-grad)`}
                stroke="#2E313A"
                strokeWidth="1.2"
              />
            )}
            {(headVariant === 1 || headVariant === 6 || headVariant === 9) && (
              // Angular Crest Crown Head / Prism / Signal
              <path
                d="M 120 46 L 160 74 L 154 142 C 154 152, 140 156, 120 156 C 100 156, 86 152, 86 142 L 80 74 Z"
                fill={`url(#${id}-helmet-grad)`}
                stroke="#2E313A"
                strokeWidth="1.2"
              />
            )}
            {(headVariant === 3 || headVariant === 8) && (
              // Hexagonal Monolith / Citadel Bastion
              <path
                d="M 90 52 L 150 52 L 160 82 L 154 142 C 154 152, 138 157, 120 157 C 102 157, 86 152, 86 142 L 80 82 Z"
                fill={`url(#${id}-helmet-grad)`}
                stroke="#2E313A"
                strokeWidth="1.2"
              />
            )}
            {(headVariant === 4 || headVariant === 5) && (
              // Crown Apex / Frame Chassis
              <path
                d="M 84 56 L 156 56 L 156 142 C 156 152, 140 156, 120 156 C 100 156, 84 152, 84 142 Z"
                fill={`url(#${id}-helmet-grad)`}
                stroke="#2E313A"
                strokeWidth="1.2"
              />
            )}

            {/* Specular Edge Highlight */}
            <path
              d="M 86 80 C 86 54, 154 54, 154 80"
              stroke={`url(#${id}-specular-rim)`}
              strokeWidth="1.5"
              fill="none"
            />

            {/* Symmetrical Lateral Ear Pods */}
            <g id="ears">
              <rect
                x="76"
                y="94"
                width="7"
                height="26"
                rx="2.5"
                fill="#1E2026"
                stroke="#32353E"
                strokeWidth="0.75"
              />
              <rect
                x="157"
                y="94"
                width="7"
                height="26"
                rx="2.5"
                fill="#1E2026"
                stroke="#32353E"
                strokeWidth="0.75"
              />
              {/* Ear Accent Dots */}
              <circle cx="79.5" cy="107" r="1.5" fill={accentColor} />
              <circle cx="160.5" cy="107" r="1.5" fill={accentColor} />
            </g>

            {/* Forehead Emblem Socket (Child of Head Shell) */}
            <g id="emblem-socket">
              {(emblemVariant === 0 || emblemVariant === 3) && (
                // Bunker Shield Glyph
                <path
                  d="M 117 68 L 123 68 L 124 74 L 120 77 L 116 74 Z"
                  fill={accentColor}
                  fillOpacity="0.9"
                />
              )}
              {(emblemVariant === 1 || emblemVariant === 4) && (
                // Diamond Sentinel Crest
                <polygon
                  points="120,66 124,71 120,76 116,71"
                  fill={accentColor}
                  fillOpacity="0.9"
                />
              )}
              {(emblemVariant === 2 || emblemVariant === 5 || emblemVariant === 6 || emblemVariant === 7) && (
                // Circular Core Beacon / Hex
                <circle cx="120" cy="71" r="3" fill={accentColor} fillOpacity="0.9" />
              )}
            </g>

            {/* Visor Socket (Child of Head Shell with dynamic depth shift) */}
            <g id="visor-socket" transform={`translate(${visorDepthX}, ${visorDepthY})`}>
              {(visorVariant === 0 || visorVariant === 5) && (
                // Horizon Visor Bar / Panoramic Arc
                <g filter={`url(#${id}-glow)`}>
                  <path
                    d="M 88 98 C 88 95, 152 95, 152 98 L 148 114 C 148 117, 92 117, 92 114 Z"
                    fill={`url(#${id}-visor-grad)`}
                  />
                  <line x1="94" y1="106" x2="146" y2="106" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.75" />
                </g>
              )}
              {(visorVariant === 1 || visorVariant === 7) && (
                // Angular Dual Aperture / Split
                <g filter={`url(#${id}-glow)`}>
                  <polygon
                    points="90,102 117,98 117,112 92,115"
                    fill={`url(#${id}-visor-grad)`}
                  />
                  <polygon
                    points="123,98 150,102 148,115 123,112"
                    fill={`url(#${id}-visor-grad)`}
                  />
                  <line x1="93" y1="107" x2="147" y2="107" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.6" />
                </g>
              )}
              {(visorVariant === 2 || visorVariant === 4) && (
                // Monolithic Narrow Sensor Slot / Blade Strip
                <g filter={`url(#${id}-glow)`}>
                  <rect
                    x="88"
                    y="102"
                    width="64"
                    height="8.5"
                    rx="4.25"
                    fill={`url(#${id}-visor-grad)`}
                  />
                  <circle cx="120" cy="106.25" r="2.5" fill="#FFFFFF" />
                </g>
              )}
              {(visorVariant === 3 || visorVariant === 6) && (
                // Geometric Hex Horizon / Halo Perimeter
                <g filter={`url(#${id}-glow)`}>
                  <polygon
                    points="90,106 97,97 143,97 150,106 143,115 97,115"
                    fill={`url(#${id}-visor-grad)`}
                  />
                  <line x1="96" y1="106" x2="144" y2="106" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
                </g>
              )}
            </g>

            {/* Optional Client Logo Badge Socket */}
            {badgeLogoUrl && (
              <g>
                <circle cx="120" cy="106" r="14" fill="#090A0E" stroke={accentColor} strokeWidth="1" />
                <image href={badgeLogoUrl} x="110" y="96" width="20" height="20" />
              </g>
            )}

            {badgeText && !badgeLogoUrl && (
              <g>
                <circle cx="120" cy="106" r="13" fill="#090A0E" stroke={accentColor} strokeWidth="1" />
                <text
                  x="120"
                  y="110"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {badgeText.slice(0, 2).toUpperCase()}
                </text>
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

export default AvatarPoster;
