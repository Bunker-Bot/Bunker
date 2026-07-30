import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { AppLogo } from '../ui/AppLogo';

export const ViewLimitExceededPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />
      {/* Grid Dots Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-zinc-800/80 rounded-sm p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <AppLogo size={36} showText={false} />
          <h2 className="text-xl font-bold text-white tracking-tight">
            View Limit Exceeded
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            This share link has reached its maximum configured view count limit.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-sm text-xs text-zinc-400 font-sans">
          Contact your project manager to issue a new share link.
        </div>
      </div>
    </div>
  );
};

export default ViewLimitExceededPage;
