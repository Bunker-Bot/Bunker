import React from 'react';
import { motion } from 'framer-motion';

export const HeroSignatureBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#050505] z-0 select-none">

      {/* Layer 1: Deep Matte Black Base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Layer 2: Soft Zinc Ambient Lighting from Both Top Corners */}
      <div className="absolute -top-32 -right-32 w-[900px] h-[900px] bg-gradient-to-bl from-zinc-700/25 via-zinc-800/15 to-transparent blur-[150px] rounded-full" />
      <div className="absolute -top-32 -left-32 w-[750px] h-[750px] bg-gradient-to-br from-zinc-700/20 via-zinc-800/10 to-transparent blur-[150px] rounded-full" />

      {/* Layer 3: Dual Intersecting Small Boxed Architectural Grids */}
      <svg
        className="absolute inset-0 w-full h-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Mask 1: Top-Right Gradient Fade */}
          <radialGradient id="bunkerGridFadeRight" cx="85%" cy="15%" r="85%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Mask 2: Top-Left Gradient Fade */}
          <radialGradient id="bunkerGridFadeLeft" cx="15%" cy="15%" r="85%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Pattern 1: Top-Right to Bottom-Left Grid (-30 deg) */}
          <pattern
            id="smallBoxGridRight"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.11)"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="1" fill="rgba(255, 255, 255, 0.2)" />
          </pattern>

          {/* Pattern 2: Top-Left to Bottom-Right Grid (+30 deg) */}
          <pattern
            id="smallBoxGridLeft"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.09)"
              strokeWidth="0.8"
            />
            <circle cx="0" cy="0" r="1" fill="rgba(255, 255, 255, 0.18)" />
          </pattern>

          {/* Subtle Grain Filter */}
          <filter id="bunkerNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.025 0" />
          </filter>
        </defs>

        {/* Grid Layer 1: Top-Right to Bottom-Left */}
        <g mask="url(#gridMaskRight)">
          <mask id="gridMaskRight">
            <rect width="100%" height="100%" fill="url(#bunkerGridFadeRight)" />
          </mask>

          <rect width="100%" height="100%" fill="url(#smallBoxGridRight)" />

          {/* Major Intersection Rays Right */}
          <line x1="100%" y1="0%" x2="0%" y2="85%" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1.2" />
          <line x1="100%" y1="12%" x2="12%" y2="100%" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
        </g>

        {/* Grid Layer 2: Top-Left to Bottom-Right */}
        <g mask="url(#gridMaskLeft)">
          <mask id="gridMaskLeft">
            <rect width="100%" height="100%" fill="url(#bunkerGridFadeLeft)" />
          </mask>

          <rect width="100%" height="100%" fill="url(#smallBoxGridLeft)" />

          {/* Major Intersection Rays Left */}
          <line x1="0%" y1="0%" x2="100%" y2="85%" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.2" />
          <line x1="0%" y1="12%" x2="88%" y2="100%" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
        </g>
      </svg>

      {/* Layer 4: Translucent Architectural Liquid-Glass Reflections */}
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 right-16 w-[550px] h-[350px] bg-gradient-to-br from-white/[0.05] via-zinc-400/[0.02] to-transparent border border-white/[0.08] rounded-sm rotate-[-18deg] backdrop-blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-12 left-16 w-[480px] h-[300px] bg-gradient-to-br from-white/[0.04] via-zinc-500/[0.01] to-transparent border border-white/[0.06] rounded-sm rotate-[18deg] backdrop-blur-2xl"
      />

      {/* Layer 5: Ultra-Fine Grain Noise Layer */}
      <div className="absolute inset-0 bg-repeat opacity-40 mix-blend-overlay" style={{ filter: 'url(#bunkerNoise)' }} />

      {/* Layer 6: Bottom Seamless Transition Mask to Solid #050505 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
    </div>
  );
};

export default HeroSignatureBackground;
