import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AvatarPoster } from '../../../features/identity-avatar/components/AvatarPoster';
import type { BunkerAvatarConfig } from '../../../features/identity-avatar/types/avatar.types';
import type { GuardianPortalMood } from './portal-entry.types';

interface PortalEntryGuardianProps {
  config: BunkerAvatarConfig;
  mood: GuardianPortalMood;
  progress: number;
  isReady: boolean;
  isHoveringCTA?: boolean;
}

export const PortalEntryGuardian: React.FC<PortalEntryGuardianProps> = ({
  config,
  mood,
  progress,
  isReady,
  isHoveringCTA = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pointer Parallax when ready
  useEffect(() => {
    if (!isReady) {
      setPointerOffset({ x: 0, y: 0 });
      return;
    }

    const handlePointerMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) return;
      const nx = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      // Restrain to subtle 2-3° (clamped)
      setPointerOffset({
        x: Math.max(-1, Math.min(1, nx * 0.4)),
        y: Math.max(-1, Math.min(1, ny * 0.3)),
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [isReady]);

  // Dynamic visual parameters according to mood/progress
  const moodSettings = React.useMemo(() => {
    switch (mood) {
      case 'dormant':
        return {
          opacity: 0.35,
          scale: 0.97,
          filter: 'brightness(0.55) contrast(0.9)',
          glowOpacity: 0.03,
          auraColor: config.glowColor || '#06B6D4',
        };
      case 'awakening':
        return {
          opacity: 0.65,
          scale: 0.985,
          filter: 'brightness(0.75) contrast(0.95)',
          glowOpacity: 0.05,
          auraColor: config.glowColor || '#06B6D4',
        };
      case 'checking':
        return {
          opacity: 0.88,
          scale: 1.0,
          filter: 'brightness(0.9) contrast(1.0)',
          glowOpacity: 0.07,
          auraColor: config.glowColor || '#06B6D4',
        };
      case 'focused':
        return {
          opacity: 0.95,
          scale: 1.0,
          filter: 'brightness(0.98) contrast(1.0)',
          glowOpacity: 0.08,
          auraColor: config.glowColor || '#06B6D4',
        };
      case 'ready':
        return {
          opacity: 1.0,
          scale: isHoveringCTA ? 1.02 : 1.0,
          filter: isHoveringCTA ? 'brightness(1.08) contrast(1.02)' : 'brightness(1.0) contrast(1.0)',
          glowOpacity: isHoveringCTA ? 0.12 : 0.08,
          auraColor: config.glowColor || '#06B6D4',
        };
      case 'attention':
        return {
          opacity: 0.9,
          scale: 0.99,
          filter: 'brightness(0.85) contrast(0.95)',
          glowOpacity: 0.06,
          auraColor: '#F59E0B',
        };
      case 'restricted':
        return {
          opacity: 0.85,
          scale: 0.98,
          filter: 'brightness(0.8) contrast(0.9)',
          glowOpacity: 0.05,
          auraColor: '#F59E0B',
        };
      case 'unavailable':
      default:
        return {
          opacity: 0.6,
          scale: 0.96,
          filter: 'brightness(0.6) grayscale(0.5)',
          glowOpacity: 0.03,
          auraColor: '#EF4444',
        };
    }
  }, [mood, config.glowColor, isHoveringCTA]);

  const effectiveLookAt = React.useMemo(() => {
    if (!isReady) {
      // Subtle progress-based head orientation
      if (progress < 25) return { x: 0, y: 0.2 };
      if (progress < 50) return { x: 0.05, y: 0.1 };
      if (progress < 75) return { x: -0.05, y: 0 };
      return { x: 0, y: 0 };
    }
    // Interactive mouse follow when ready
    return isHoveringCTA ? { x: 0, y: -0.1 } : pointerOffset;
  }, [isReady, progress, isHoveringCTA, pointerOffset]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center select-none w-full"
      style={{
        height: 'clamp(230px, 38vh, 460px)',
        maxHeight: '480px',
      }}
    >
      {/* 1. Subtle Radial Ambient Halo Aura */}
      <motion.div
        animate={{
          opacity: moodSettings.glowOpacity,
          scale: isReady ? [1, 1.04, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.6, ease: 'easeOut' },
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute w-[320px] sm:w-[420px] lg:w-[520px] aspect-square rounded-full blur-3xl pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle, ${moodSettings.auraColor} 0%, transparent 70%)`,
        }}
      />

      {/* 2. Soft Floor Vignette Reflector */}
      <div className="absolute bottom-2 w-48 sm:w-64 h-8 bg-black/80 rounded-full blur-md -z-10" />

      {/* 3. Guardian Visual Presentation Container */}
      <motion.div
        animate={{
          opacity: moodSettings.opacity,
          scale: moodSettings.scale,
          filter: moodSettings.filter,
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full h-full max-w-[420px] flex items-center justify-center relative"
      >
        <AvatarPoster
          config={config}
          size="100%"
          showBackdrop={true}
          lookAtOffset={effectiveLookAt}
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};

export default PortalEntryGuardian;
