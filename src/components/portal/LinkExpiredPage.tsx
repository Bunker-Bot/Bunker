import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../ui/AppLogo';

export const LinkExpiredPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
      {/* Grid Dots Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <HugeiconsIcon icon={Clock01Icon} size={24} />
          </div>
          <AppLogo size={36} showText={false} />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Share Link Expired
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            This client portal share link has passed its expiration time and is no longer valid.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-sm text-xs text-zinc-400 font-sans">
          Please contact your agency lead to request a new access link.
        </div>
      </div>
    </div>
  );
};

export default LinkExpiredPage;
