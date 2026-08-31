import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuardianAvatars } from '../data/avatar.queries';
import { AvatarPoster } from '../components/AvatarPoster';
import { generateCandidateVariants } from '../lib/avatar-generator';
import { AvatarStudioShell } from './AvatarStudioShell';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

export const AvatarVariantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: avatars = [] } = useGuardianAvatars();
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  const activeMaster = avatars.find((a) => a.id === selectedMasterId) || avatars[0] || null;

  const candidateVariants = React.useMemo(() => {
    if (!activeMaster) return [];
    return generateCandidateVariants(activeMaster.config, 4);
  }, [activeMaster]);

  return (
    <AvatarStudioShell activeTab="variants">
      <div className="w-full space-y-6 font-mono text-xs select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={20} className="text-cyan-400" />
              <span>Identity Variant Explorer</span>
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Generate deterministic archetype alternatives while preserving core cryptographic traits.
            </p>
          </div>

          {activeMaster && (
            <button
              type="button"
              onClick={() => navigate(`/app/avatar-studio/${activeMaster.id}/edit`)}
              className="px-4 py-2 rounded-sm bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={Settings02Icon} size={14} />
              <span>Open Master in Guardian Creator</span>
            </button>
          )}
        </div>

        {/* Master Selector Strip */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Select Master Identity Baseline
          </label>
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            {avatars.map((a) => {
              const isSelected = activeMaster?.id === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedMasterId(a.id)}
                  className={`p-2.5 rounded-sm border text-left transition-all cursor-pointer flex items-center gap-3 shrink-0 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/50 text-white shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                    <AvatarPoster config={a.config} size="100%" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block text-white">{a.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">#{a.avatarCode}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Generated Candidate Cards */}
        {activeMaster && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-400">
                Candidate Variants for <span className="text-white">{activeMaster.name}</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-bold">4 Curated Iterations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {candidateVariants.map((v, i) => (
                <div
                  key={i}
                  className="rounded-sm bg-zinc-950/80 border border-zinc-800 p-4 space-y-4 shadow-xl hover:border-cyan-500/60 transition-all group"
                >
                  <div className="w-full aspect-square rounded bg-zinc-900/80 border border-zinc-800/80 p-3 relative overflow-hidden flex items-center justify-center">
                    <AvatarPoster config={v} size="100%" showBackdrop={true} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs">Variant 0{i + 1}</span>
                      <span className="text-[10px] text-zinc-500 capitalize">{v.archetype}</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 font-sans">
                      {v.material} finish with {v.visorTint} optic scan sensor.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/app/avatar-studio/create`);
                    }}
                    className="w-full py-2 rounded-sm bg-zinc-900 hover:bg-cyan-950/80 border border-zinc-800 hover:border-cyan-700 text-zinc-200 hover:text-cyan-300 font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    Use in Creator
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AvatarStudioShell>
  );
};

export default AvatarVariantsPage;
