import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Shield02Icon,
  SparklesIcon,
  ColorsIcon,
  FolderCheckIcon,
} from '@hugeicons/core-free-icons';
import { AvatarPoster } from '../../../../features/identity-avatar';
import { generateAvatarConfig } from '../../../../features/identity-avatar/lib/avatar-generator';
import type { Team } from '../../types/team.types';

interface TeamIdentityViewProps {
  team: Team;
}

export const TeamIdentityView: React.FC<TeamIdentityViewProps> = ({ team }) => {
  const navigate = useNavigate();

  const avatarConfig = useMemo(() => {
    return (
      team.avatarConfig ||
      generateAvatarConfig({
        entityId: team.slug,
        entityKind: 'team',
        name: team.name,
        preferredColor: team.primaryColor || '#06B6D4',
      })
    );
  }, [team]);

  const guardianCode = team.avatarCode || '6824103957';

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <HugeiconsIcon icon={Shield02Icon} size={16} />
            Team Guardian Identity
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{team.name} Guardian</h2>
          <p className="text-xs text-zinc-400">
            Collective digital sentinel representing leadership, coordination, and team stability
          </p>
        </div>

        <button
          onClick={() => navigate(`/app/avatar-studio/team/${team.id}`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-black text-xs font-semibold rounded-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          <HugeiconsIcon icon={SparklesIcon} size={16} />
          Customize in Avatar Studio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar Showcase */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-zinc-900/60 border border-zinc-800 rounded-sm relative overflow-hidden min-h-[420px]">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold bg-zinc-950/80 border border-zinc-800 text-cyan-400 rounded-sm backdrop-blur-md">
              Guardian ID #{guardianCode}
            </span>
          </div>

          <div className="w-64 h-64 relative flex items-center justify-center bg-zinc-950 rounded-sm border border-zinc-800 shadow-2xl p-4">
            <AvatarPoster config={avatarConfig} size="100%" />
          </div>

          <div className="text-center mt-4 z-10">
            <div className="text-xs text-zinc-300 font-semibold">{avatarConfig.archetype.toUpperCase()} ARCHETYPE</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Deterministic Team Guardian Vector Architecture</div>
          </div>
        </div>

        {/* Right Column: Identity Specifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand Colors */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <HugeiconsIcon icon={ColorsIcon} size={16} className="text-purple-400" />
              Team Brand Palette
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm space-y-2">
                <div
                  className="w-full h-8 rounded-sm shadow-sm"
                  style={{ backgroundColor: team.primaryColor || '#06B6D4' }}
                />
                <div className="text-[10px] text-zinc-400">Primary</div>
                <div className="text-xs font-bold text-zinc-200">{team.primaryColor || '#06B6D4'}</div>
              </div>

              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm space-y-2">
                <div
                  className="w-full h-8 rounded-sm shadow-sm"
                  style={{ backgroundColor: team.secondaryColor || '#8B5CF6' }}
                />
                <div className="text-[10px] text-zinc-400">Secondary</div>
                <div className="text-xs font-bold text-zinc-200">{team.secondaryColor || '#8B5CF6'}</div>
              </div>

              <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-sm space-y-2">
                <div
                  className="w-full h-8 rounded-sm shadow-sm"
                  style={{ backgroundColor: team.accentColor || '#10B981' }}
                />
                <div className="text-[10px] text-zinc-400">Accent</div>
                <div className="text-xs font-bold text-zinc-200">{team.accentColor || '#10B981'}</div>
              </div>
            </div>
          </div>

          {/* Project Style Inheritance Note */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <HugeiconsIcon icon={FolderCheckIcon} size={16} className="text-cyan-400" />
              Project Style Inheritance
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When creating projects under this team, selecting <span className="text-cyan-400 font-semibold">"Start from Team Style"</span> automatically inherits the team’s material, palette, and surface language while issuing a brand new, unique Project Guardian ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
