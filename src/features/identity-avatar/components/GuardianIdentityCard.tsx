import React from 'react';
import { AvatarPoster } from './AvatarPoster';
import { AvatarCode } from './AvatarCode';
import type { BunkerAvatarConfig } from '../types/avatar.types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Folder01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';

export interface GuardianIdentityCardProps {
  config: BunkerAvatarConfig;
  avatarCode: string;
  name: string;
  projectName?: string | null;
  clientName?: string | null;
  status?: string | null;
  variant?: 'studio' | 'project' | 'portal-popover' | 'share-preview';
  className?: string;
}

export const GuardianIdentityCard: React.FC<GuardianIdentityCardProps> = ({
  config,
  avatarCode,
  name,
  projectName,
  clientName,
  status = 'Active',
  variant = 'studio',
  className = '',
}) => {
  if (variant === 'portal-popover') {
    return (
      <div className={`w-72 p-4 rounded-sm bg-zinc-950/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl font-mono text-xs space-y-3.5 select-none text-zinc-200 ${className}`}>
        {/* Top Header: Mini Poster + Identity Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-sm bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
            <AvatarPoster config={config} size="100%" />
          </div>
          <div className="min-w-0 space-y-0.5 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                <HugeiconsIcon icon={SparklesIcon} size={11} />
                <span>Bunker Guardian</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Identity" />
            </div>
            <h4 className="font-bold text-white text-sm truncate">{name}</h4>
            <AvatarCode code={avatarCode} size="xs" />
          </div>
        </div>

        {/* Project & Client Scope */}
        <div className="p-2.5 rounded-sm bg-zinc-900/80 border border-zinc-850 space-y-1.5 text-[11px]">
          {projectName && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-bold uppercase text-[9.5px]">Project</span>
              <span className="text-white font-bold truncate max-w-[150px]">{projectName}</span>
            </div>
          )}
          {clientName && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-500 font-bold uppercase text-[9.5px]">Client</span>
              <span className="text-zinc-300 truncate max-w-[150px]">{clientName}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[9.5px]">Status</span>
            <span className="text-emerald-300 font-bold uppercase text-[10px]">{status}</span>
          </div>
        </div>

        {/* Identity Security Description */}
        <div className="flex items-start gap-2 text-[10px] text-zinc-400 leading-relaxed font-sans">
          <HugeiconsIcon icon={Shield01Icon} size={13} className="text-cyan-400 shrink-0 mt-0.5" />
          <p>
            A unique Bunker Guardian identity assigned to this project and used across its secure client portal.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'project') {
    return (
      <div className={`p-3.5 rounded-sm bg-zinc-950/80 border border-zinc-800/80 font-mono text-xs space-y-2.5 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
            Project Identity
          </span>
          <AvatarCode code={avatarCode} size="xs" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-sm bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
            <AvatarPoster config={config} size="100%" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="font-bold text-white truncate text-xs">{name}</p>
            <p className="text-[10px] text-zinc-400 capitalize">
              {config.material} • {config.archetype}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'share-preview') {
    return (
      <div className={`w-full aspect-[1200/630] rounded-sm bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between overflow-hidden shadow-2xl relative select-none font-mono ${className}`}>
        {/* Glow */}
        <div
          className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: config.glowColor }}
        />

        <div className="flex justify-between items-center text-xs text-zinc-400 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">BUNKER VAULT</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 uppercase text-[10px] font-bold">Secure Client Portal</span>
          </div>
          <AvatarCode code={avatarCode} size="xs" showCopy={false} />
        </div>

        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 min-w-0 flex-1">
            <span className="text-xs text-sky-400 font-bold truncate block">
              Client: {clientName || 'Authorized Partner'}
            </span>
            <h3 className="font-extrabold text-white text-xl truncate leading-tight">
              {projectName || name}
            </h3>
            <p className="text-xs text-zinc-400 font-sans line-clamp-2 max-w-sm">
              Zero-trust client deliverables, milestones, timeline, and cryptographic verification.
            </p>
          </div>

          <div className="w-24 h-24 rounded-sm bg-zinc-900 border border-zinc-800 shrink-0 flex items-center justify-center shadow-lg">
            <AvatarPoster config={config} size="100%" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900 pt-2 relative z-10 font-sans">
          <span>React • Supabase • TypeScript</span>
          <span className="font-mono text-zinc-400">bunker.sh</span>
        </div>
      </div>
    );
  }

  // Default 'studio' card
  return (
    <div className={`p-4 rounded-sm bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all font-mono text-xs space-y-3 shadow-md ${className}`}>
      <div className="w-full aspect-square rounded-sm bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
        <AvatarPoster config={config} size="100%" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white truncate text-xs">{name}</h4>
          <AvatarCode code={avatarCode} size="xs" />
        </div>
        {projectName && (
          <p className="text-[10.5px] text-zinc-400 truncate flex items-center gap-1 font-sans">
            <HugeiconsIcon icon={Folder01Icon} size={11} className="text-zinc-500 shrink-0" />
            <span className="truncate">{projectName}</span>
          </p>
        )}
      </div>
    </div>
  );
};
